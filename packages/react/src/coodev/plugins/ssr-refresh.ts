import * as path from 'path'
import { COODEV_REACT_SOURCE_DIR } from '../constants'
import type { Plugin } from 'vite'

export function ssrRefresh(): Plugin {
  return {
    name: 'ssr-refresh',
    handleHotUpdate({ modules, server }) {
      for (const module of modules) {
        server.moduleGraph.urlToModuleMap.delete(module.url)
      }
      // @coodev/react/src/server.tsx
      server.moduleGraph.urlToModuleMap.delete(
        path.resolve(COODEV_REACT_SOURCE_DIR, './server.tsx'),
      )
    },
  }
}
