import type { ViteDevServer } from 'vite'
import type { AddressInfo } from 'node:net'
import { type ChildProcess, spawn } from 'node:child_process'
import { context as esbuildContext, type Plugin } from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'

/**
 * Vite 插件，用于开发过程中的热重载功能
 */
export const devPlugin = () => {
  return {
    name: 'dev-plugin',
    async configureServer(server: ViteDevServer) {
      // 为 esbuild 添加 @ 别名解析（支持目录 index 与扩展名补全）
      const aliasAtPlugin: Plugin = {
        name: 'alias-@',
        setup(build) {
          const root = process.cwd()
          const tryResolveFile = (base: string) => {
            const exts = ['.ts', '.tsx', '.js', '.mjs', '.cjs']
            for (const ext of exts) {
              const p = base + ext
              if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                return p
              }
            }
            return null
          }
          const tryResolveIndex = (dir: string) => {
            const exts = ['index.ts', 'index.tsx', 'index.js', 'index.mjs', 'index.cjs']
            for (const name of exts) {
              const p = path.join(dir, name)
              if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                return p
              }
            }
            return null
          }
          build.onResolve({ filter: /^@\// }, (args) => {
            const rel = args.path.slice(2) // 去掉 '@/'
            const abs = path.join(root, 'src', rel)
            try {
              if (fs.existsSync(abs)) {
                const stat = fs.statSync(abs)
                if (stat.isDirectory()) {
                  const idx = tryResolveIndex(abs)
                  if (idx) {
                    return { path: idx }
                  }
                } else if (stat.isFile()) {
                  return { path: abs }
                }
              }
              const file = tryResolveFile(abs)
              if (file) {
                return { path: file }
              }
            } catch {}
            // 回退：让 esbuild 按返回的路径尝试（可能会报错，利于暴露真实问题）
            return { path: abs }
          })
        },
      }

      let electronProcess: ChildProcess | null = null
      let httpAddress: string | null = null
      let restartTimer: NodeJS.Timeout | null = null
      let initialBuildDone = false

      /**
       * 启动 Electron
       */
      const startElectron = async () => {
        if (!httpAddress || !initialBuildDone) return
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
       * esbuild插件：主进程重构后重启 Electron
       */
      const restartOnEndPlugin: Plugin = {
        name: 'electron-restart-on-end',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              console.error('主进程重构失败:', result.errors)
              return
            }
            if (!initialBuildDone) {
              initialBuildDone = true
              startElectron()
              return
            }
            console.log('主进程重构完成，重启Electron...')
            restartElectron()
          })
        },
      }

      // 创建 esbuild 上下文，并开始第一次构建 + 监听
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
          plugins: [aliasAtPlugin, restartOnEndPlugin],
        })
      } catch (e) {
        console.error('[dev-plugin] esbuild上下文环境初始化失败:', e)
        return // do not crash Vite
      }
      try {
        await ctx.rebuild()
        await ctx.watch()
      } catch (e) {
        console.error('[dev-plugin] esbuild构建/监听失败:', e)
      }

      /**
       * 监听 Vite 服务器关闭，并关闭 esbuild 上下文环境
       */
      const disposeWatcher = () => ctx!.dispose()

      // 监听 Vite 服务器启动，并获取 http 服务地址
      server.httpServer?.once('listening', () => {
        const addressInfo = server.httpServer?.address() as AddressInfo
        let host = addressInfo.address
        // 统一到 localhost，避免 ::1 等 IPv6 地址在 Electron 中偶发导航中断
        if (host === '::' || host === '::1' || host === '0.0.0.0') {
          host = 'localhost'
        } else {
          type Family = 'IPv4' | 'IPv6'
          const family = (addressInfo as AddressInfo & { family?: Family }).family
          if (family === 'IPv6' && !host.startsWith('[')) {
            host = `[${host}]`
          }
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
 */
export const getReplacer = () => {
  type ReplacerFactory = () => { find: RegExp; code: string }
  const externalModels = [
    'os',
    'fs',
    'path',
    'events',
    'child_process',
    'crypto',
    'http',
    'buffer',
    'url',
    'better-sqlite3',
    'knex',
  ]
  const result: Record<string, ReplacerFactory> = {}
  for (const item of externalModels) {
    const varName = item.replace(/[^a-zA-Z0-9_]/g, '_')
    // 裸模块名支持（如 'crypto'）
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${varName} = require('${item}');export { ${varName} as default }`,
    })
    // node: 前缀支持（如 'node:crypto'）
    result[`node:${item}`] = () => ({
      find: new RegExp(`^node:${item}$`),
      code: `const ${varName} = require('${item}');export { ${varName} as default }`,
    })
  }
  result['electron'] = () => {
    const electronModules = ['clipboard', 'ipcRenderer', 'nativeImage', 'shell', 'webFrame'].join(',')
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    }
  }
  return result
}
