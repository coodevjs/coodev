import * as path from 'path'
import { codellSourceDir } from '../constants'
import type { Plugin } from 'vite'

export function ssrRefresh(): Plugin {
  return {
    name: 'ssr-refresh',
    handleHotUpdate({ modules, server }) {
      for (const module of modules) {
        server.moduleGraph.urlToModuleMap.delete(module.url)
      }
      // @codell/react/src/server.tsx
      server.moduleGraph.urlToModuleMap.delete(
        path.resolve(codellSourceDir, './server.tsx'),
      )
    },
  }
}
