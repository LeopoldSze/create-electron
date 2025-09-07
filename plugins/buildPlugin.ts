import path from 'node:path'
import fs from 'node:fs'
import { buildSync } from 'esbuild'
import type { Configuration } from 'electron-builder'
import { build } from 'electron-builder'

class BuildObj {
  /**
   * 编译主进程代码
   * @description 启用生产环境压缩
   */
  buildMain() {
    try {
      buildSync({
        entryPoints: ['./src/main/mainEntry.ts'],
        bundle: true,
        platform: 'node',
        target: ['node20'],
        minify: true,
        external: ['electron'],
        outfile: './dist/mainEntry.js',
      })
    } catch (error) {
      console.error('[build plugin] 初始化esbuild失败:', error)
    }
  }

  /**
   * 设置package.json
   * @description 1. 读取根 package.json，抽取 devDependencies.electron 的版本（去掉 ^），设置 main 为 mainEntry.js
   * 2. 删除 scripts 和 devDependencies，再仅保留 electron 作为 devDependencies（保证 dist 下运行 Electron 可安装依赖）
   * 3. 写入 dist/package.json，并创建 dist/node_modules 目录（为后续 electron-builder 打包做准备）
   */
  preparePackageJson() {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const localPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const electronConfig = localPackageJson.devDependencies.electron.replace('^', '')
      localPackageJson.main = 'mainEntry.js'
      delete localPackageJson.scripts
      delete localPackageJson.devDependencies
      localPackageJson.devDependencies = {
        electron: electronConfig,
      }
      const targetPackageJsonPath = path.join(process.cwd(), 'dist', 'package.json')
      fs.writeFileSync(targetPackageJsonPath, JSON.stringify(localPackageJson, null, 2))
      fs.mkdirSync(path.join(process.cwd(), 'dist', 'node_modules'), { recursive: true })
    } catch (error) {
      console.error('[build plugin] 创建package.json失败:', error)
    }
  }

  /**
   * 构建安装包
   */
  buildInstaller() {
    const config: Configuration = {
      appId: 'com.leopold.juejin', // 应用唯一 ID；Windows（NSIS 目标）强烈建议显式设置，且一旦发布不可轻易更改，以避免升级/卸载等问题
      productName: 'Juejin', // 产品名；用于生成产物名、安装器标题等
      asar: true, // 是否将应用内容打包为 asar，有助于减小体积与保护源码
      directories: {
        app: path.join(process.cwd(), 'dist'), // 源代码目录
        output: path.join(process.cwd(), 'release'), // 产物目录
      },
      files: ['**'], // 构建时需要打包的文件，**表示所有文件
      // Windows 默认目标安装器（NSIS）的配置
      nsis: {
        oneClick: false, // 是否一键安装（true 则不显示安装目录/组件页），设为 false 表示使用“向导式安装”
        perMachine: true, // 是否为所有用户安装（需要管理员权限），默认为 false；设为 true 表示面向所有用户
        allowToChangeInstallationDirectory: true, // 允许用户变更安装目录；通常在 oneClick=false 的场景开启
        createDesktopShortcut: true, // 是否创建桌面快捷方式（可取 boolean 或 "always"）
        createStartMenuShortcut: true, // 是否创建开始菜单快捷方式
        shortcutName: 'Sze', // 快捷方式名称
        deleteAppDataOnUninstall: true, // 是否删除用户数据目录下的应用数据
      },
      // 发布与自动更新配置，自动更新仅依赖列表中的第一个 provider；当前将第一个 provider 设置为 generic，表示“自建或自托管”服务器方案
      // generic：通用静态文件服务器；需手动上传构建产物与更新元数据；electron-builder 负责生成 app-update.yml 以供客户端 autoUpdater 使用
      // url：更新服务基础地址（通常是静态文件目录或简单 HTTP 服务器），建议以斜杠结尾，便于路径拼接
      publish: [{ provider: 'generic', url: 'http://localhost:5500/' }],
      extends: null,
    }

    return build({ config, projectDir: process.cwd() })
  }
}

/**
 * 构建插件
 * @description 在 closeBundle 钩子中顺序执行 buildMain → preparePackageJson → buildInstaller，实现“Vite 资源构建完成后，继续编译主进程并产出安装包”
 */
export const buildPlugin = () => {
  const buildObj = new BuildObj()

  return {
    name: 'buildPlugin',
    // 在构建结束后触发
    closeBundle: async () => {
      buildObj.buildMain()
      buildObj.preparePackageJson()
      try {
        await buildObj.buildInstaller()
      } catch (e) {
        console.error('[build plugin] electron-builder 构建失败:')
        // 尽量打印更多信息，帮助定位问题
        if (e instanceof Error) {
          console.error(e.message)
          console.error(e.stack)
        } else {
          console.error(e)
        }
        throw e
      }
    },
  }
}
