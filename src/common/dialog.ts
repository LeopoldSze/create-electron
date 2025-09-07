import type { AppWindowOptions } from '@/types/window.ts'

/**
 * 创建窗口
 * @param url
 * @param config
 */
const createDialog = (url: string, config: AppWindowOptions): Promise<Window> => {
  return new Promise((resolve, reject) => {
    const windowProxy = window.open(url, "_blank", JSON.stringify(config));
    if (!windowProxy) {
      reject(new Error('Failed to open window'))
      return
    }
    const openedWindow: Window = windowProxy

    const readyHandler = (e: MessageEvent<any>) => {
      const msg = e.data as { msgName?: string }
      if (msg && msg.msgName === '__dialogReady') {
        window.removeEventListener("message", readyHandler);
        resolve(openedWindow);
      }
    };
    window.addEventListener("message", readyHandler);
  });
};

/**
 * 窗口已就绪
 */
const dialogReady = () => {
  const msg = { msgName: '__dialogReady' };
  window.opener.postMessage(msg);
};

export { createDialog, dialogReady }
