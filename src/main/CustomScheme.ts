import { protocol } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

// 为自定义的app协议提供特权
const schemeConfig = {
  standard: true,
  supportFetchAPI: true,
  bypassCSP: true,
  corsEnabled: true,
  stream: true
}
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: schemeConfig }])

export class CustomScheme {
  /**
   * 根据文件扩展名获取mime-type
   * @param extension
   * @private
   */
  private static getMimeType(extension: string) {
    const map: Record<string, string> = {
      '.js': 'text/javascript',
      '.mjs': 'text/javascript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.map': 'application/json',
      '.wasm': 'application/wasm',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.txt': 'text/plain; charset=utf-8',
      '.csv': 'text/csv; charset=utf-8'
    }
    return map[extension] ?? 'application/octet-stream'
  }

  /**
   * 注册自定义app协议
   */
  static registerScheme() {
    const rootDir = __dirname
    protocol.handle('app', async (request) => {
      try {
        // 从 URL 取出 host + pathname，避免丢失首段目录（如 app://assets/...）
        const url = new URL(request.url)
        let composed = (url.host ? url.host : '') + url.pathname
        // 去掉开头的 '/'
        if (composed.startsWith('/')) {
          composed = composed.slice(1)
        }
        let pathname = decodeURIComponent(composed)

        // 如果没有扩展名，默认访问 index.html（支持直达路由）
        let extension = path.extname(pathname).toLowerCase()
        if (extension === '') {
          pathname = 'index.html'
          extension = '.html'
        }

        // 构建目标文件的绝对路径，并做路径穿越防护
        const targetPath = path.resolve(rootDir, pathname)
        const relative = path.relative(rootDir, targetPath)
        const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative)
        if (!isSafe) {
          return new Response('Bad Request', {
            status: 400,
            headers: { 'content-type': 'text/plain' }
          })
        }

        // 若文件不存在：对 HTML 或无扩展访问进行 SPA 兜底；否则返回 404
        const exists = fs.existsSync(targetPath)
        if (!exists) {
          if (extension === '.html') {
            const fallback = path.join(rootDir, 'index.html')
            const stream = Readable.toWeb(
              fs.createReadStream(fallback)
            ) as unknown as ReadableStream
            return new Response(stream, { headers: { 'content-type': 'text/html' } })
          }
          return new Response('Not Found', {
            status: 404,
            headers: { 'content-type': 'text/plain' }
          })
        }

        // 以流方式返回文件内容
        const nodeStream = fs.createReadStream(targetPath)
        const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream
        return new Response(webStream, { headers: { 'content-type': this.getMimeType(extension) } })
      } catch (e) {
        console.error('自定义协议处理失败：', e)
        return new Response('Internal Server Error', {
          status: 500,
          headers: { 'content-type': 'text/plain' }
        })
      }
    })
  }
}
