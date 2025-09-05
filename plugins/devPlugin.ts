import type { ViteDevServer } from 'vite'
import type { AddressInfo } from 'node:net'
import { type ChildProcess, spawn } from 'node:child_process'
import { buildSync, context as esbuildContext, type Plugin } from 'esbuild'

/**
 * Vite 插件，用于开发过程中的热重载功能
 */
export const devPlugin = () => {
  return {
    name: 'dev-plugin',
    async configureServer(server: ViteDevServer) {
      // 在启动 Electron 之前，使用 esbuild 的同步构建 (buildSync) 确保输出目录 (./dist/) 下存在一个可运行的主进程入口文件 (mainEntry.js)
      try {
        buildSync({
          entryPoints: ['./src/main/mainEntry.ts'],
          bundle: true,
          platform: 'node',
          target: ['node20'],
          outfile: './dist/mainEntry.js',
          external: ['electron'],
          sourcemap: true,
          logLevel: 'info',
        })
      } catch (e) {
        console.error('[dev-plugin] 初始化esbuild失败:', e)
        // Do not throw; keep Vite running so user can see errors
      }

      let electronProcess: ChildProcess | null = null
      let httpAddress: string | null = null
      let restartTimer: NodeJS.Timeout | null = null

      /**
       * 启动 Electron
       * @description 1. 获取 Electron 二进制文件路径
       * 2. 使用 child_process.spawn 启动 Electron 进程，参数为打包好的主进程入口文件、Vite 的 http 服务地址，被传递给主进程，这样主进程就知道该加载哪个 URL 到浏览器窗口中
       * 3. 监听 Electron 进程的关闭事件，并关闭 Vite 服务器
       */
      const startElectron = async () => {
        if (!httpAddress) return
        let electronPath: string
        try {
          const mod = await import('electron')
          electronPath = String((mod as any).default ?? mod)
        } catch (err) {
          console.error('\n[dev-plugin] 解析Electron可执行文件路径失败.\n', err)
          return
        }
        electronProcess = spawn(electronPath, ['./dist/mainEntry.js', httpAddress], {
          cwd: process.cwd(),
          stdio: 'inherit',
        })
        electronProcess.on('close', () => {
          server.close().then((r) => console.log('server closed:', r))
          process.exit()
        })
      }

      /**
       * 重启 Electron
       * @description 1. 创建一个定时器，在 150ms 后重启 Electron 进程
       * 2. 在 150ms 后，如果主进程代码被修改，则关闭当前 Electron 进程，并重新启动 Electron 进程
       */
      const restartElectron = () => {
        if (!httpAddress) return
        if (restartTimer) clearTimeout(restartTimer)
        restartTimer = setTimeout(() => {
          if (electronProcess && !electronProcess.killed) {
            try {
              electronProcess.kill()
            } catch {}
          }
          startElectron()
        }, 150)
      }

      /**
       * esbuild插件
       * @description 开发过程中的热重载功能。当修改了主进程代码后，Esbuild 会重新构建这些代码，构建完成后通过这个插件自动重启 Electron 应用，使更改生效
       */
      const restartOnEndPlugin: Plugin = {
        name: 'electron-restart-on-end',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              console.error('主进程重构失败:', result.errors)
              return
            }
            console.log('主进程重构完成，重启Electron...')
            restartElectron()
          })
        },
      }

      // 创建 esbuild 上下文，并开始监听文件修改
      let ctx
      try {
        ctx = await esbuildContext({
          entryPoints: ['./src/main/mainEntry.ts'],
          bundle: true,
          platform: 'node',
          target: ['node22'],
          outfile: './dist/mainEntry.js',
          external: ['electron'],
          sourcemap: true,
          logLevel: 'info',
          plugins: [restartOnEndPlugin],
        })
      } catch (e) {
        console.error('[dev-plugin] esbuild上下文环境初始化失败:', e)
        return // do not crash Vite
      }
      try {
        await ctx.watch()
      } catch (e) {
        console.error('[dev-plugin] esbuild监听失败:', e)
      }

      /**
       * 监听 Vite 服务器关闭，并关闭 esbuild 上下文环境
       */
      const disposeWatcher = () => ctx!.dispose()

      // 监听 Vite 服务器启动，并获取 http 服务地址
      server.httpServer?.once('listening', () => {
        const addressInfo = server.httpServer?.address() as AddressInfo
        let host = addressInfo.address
        if (host === '::' || host === '0.0.0.0') {
          host = 'localhost'
        }
        type Family = 'IPv4' | 'IPv6'
        const family = (addressInfo as AddressInfo & { family?: Family }).family
        if (family === 'IPv6' && !host.startsWith('[')) {
          host = `[${host}]`
        }
        httpAddress = `http://${host}:${addressInfo.port}`
        startElectron()
      })

      // 监听 Vite 服务器关闭，并关闭 Electron 进程
      server.httpServer?.once('close', () => {
        disposeWatcher().catch(() => {})
        if (electronProcess && !electronProcess.killed) {
          try {
            electronProcess.kill()
          } catch {}
        }
      })
    },
  }
}

/**
 * 获取替换器
 * @description 渲染进程无法访问 Node.js 的模块和Electron的模块，通过这个函数将常用的 Node 模块和 electron 的内置模块提供给了 vite-plugin-optimizer 插件，以后想要增加新的内置模块只要修改这个方法即可
 */
export const getReplacer = () => {
  type ReplacerFactory = () => { find: RegExp; code: string }
  const externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  const result: Record<string, ReplacerFactory> = {};
  for (const item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    const electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
};
