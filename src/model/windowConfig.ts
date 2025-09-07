// 删除无用导入

/**
 * 窗口配置
 */
import type { AppWindowOptions } from '@/types/window'

const windowConfig: AppWindowOptions = {
  frame: false,
  show: true,
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

export { windowConfig }
