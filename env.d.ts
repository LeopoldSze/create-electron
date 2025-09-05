/// <reference types="vite/client" />

/**
 * vite-plugin-optimizer模块类型声明
 */
declare module 'vite-plugin-optimizer' {
  import type { PluginOption } from 'vite'
  const defaultExport: (replacers: Record<string, () => { find: RegExp; code: string }>) => PluginOption
  export default defaultExport
}
