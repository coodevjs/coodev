import * as path from 'path'
import { railingSourceDir } from '../constants'
import type { Plugin } from 'vite'

export function ssrRefresh(): Plugin {
  return {
    name: 'ssr-refresh',
    handleHotUpdate({ modules, server }) {
      for (const module of modules) {
        server.moduleGraph.urlToModuleMap.delete(module.url)
      }
      // react-renderer/src/server.tsx
      server.moduleGraph.urlToModuleMap.delete(
        path.resolve(railingSourceDir, './server.tsx'),
      )
    },
  }
}
