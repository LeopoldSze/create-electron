import { app, BrowserWindow, ipcMain } from 'electron'
import { windowConfig } from '../model/windowConfig'
import type { AppWindowOptions } from '../types/window'

export default class CommonWindowEvent {
  private static getWin(event: any) {
    return BrowserWindow.fromWebContents(event.sender)
  }
  public static listen() {
    ipcMain.handle('minimizeWindow', (e) => {
      this.getWin(e)?.minimize()
    })

    ipcMain.handle('maximizeWindow', (e) => {
      this.getWin(e)?.maximize()
    })

    ipcMain.handle('unmaximizeWindow', (e) => {
      this.getWin(e)?.unmaximize()
    })

    ipcMain.handle('hideWindow', (e) => {
      this.getWin(e)?.hide()
    })

    ipcMain.handle('showWindow', (e) => {
      this.getWin(e)?.show()
    })

    ipcMain.handle('closeWindow', (e) => {
      this.getWin(e)?.close()
    })

    ipcMain.handle('resizable', (e) => {
      return this.getWin(e)?.isResizable()
    })

    ipcMain.handle('getPath', (e, name: any) => {
      return app.getPath(name)
    })
  }
  public static regWinEvent(win: BrowserWindow) {
    win.on('maximize', () => {
      win.webContents.send('windowMaximized')
    })

    win.on('unmaximize', () => {
      win.webContents.send('windowUnmaximized')
    })

    /**
     * 注册打开子窗口的回调函数
     */
    win.webContents.setWindowOpenHandler((param) => {
      // 基础窗口配置对象
      const config: AppWindowOptions = structuredClone(windowConfig)
      // 开发者自定义窗口配置对象
      const features = JSON.parse(param.features) as Partial<AppWindowOptions>
      if (features.webPreferences) {
        config.webPreferences = { ...config.webPreferences, ...features.webPreferences }
      }
      for (const p in features) {
        if (p !== 'webPreferences') {
          // @ts-expect-error 精确键入由 Electron 类型约束
          config[p] = (features as any)[p]
        }
      }
      if (config['modal'] === true) {
        config.parent = win
      }
      // 允许打开窗口，并传递窗口配置对象
      return { action: 'allow', overrideBrowserWindowOptions: config }
    })
  }
}
