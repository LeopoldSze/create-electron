import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  const config = {
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true
    }
  }
  const mainWindow = new BrowserWindow(config)
  mainWindow.webContents.openDevTools({ mode: 'undocked'})
  void mainWindow.loadURL(process.argv[2]).then(r => console.log('load finished:', r))
})
