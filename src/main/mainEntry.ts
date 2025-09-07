import { app, BrowserWindow } from 'electron'
import { CustomScheme } from './CustomScheme'
import CommonWindowEvent from './CommonWindowEvent'
import { windowConfig } from '../model/windowConfig'

// 禁用安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'false';

app.on('browser-window-created', (e, win) => {
  CommonWindowEvent.regWinEvent(win)
})

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow(windowConfig)
  mainWindow.webContents.openDevTools({ mode: 'undocked' })
  if (process.argv[2]) {
    mainWindow.loadURL(process.argv[2]).catch((e) => console.error('启动失败：', e))
  } else {
    CustomScheme.registerScheme()
    mainWindow.loadURL(`app://index.html`).catch((e) => console.error('启动失败：', e))
  }
  CommonWindowEvent.listen()
  CommonWindowEvent.regWinEvent(mainWindow)
})
