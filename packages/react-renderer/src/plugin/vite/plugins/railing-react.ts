import { Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { userSourceDir, railingSourceDir } from '../../constants'
import type { IRailingConfig } from '@railing/types'
import type { IRailingReactRouteConfig } from '../../../types'

const railingVirtualModuleIds = {
  config: '__RAILING__/config',
  routes: '__RAILING__/react/routes',
  app: '__RAILING__/react/app',
  document: '__RAILING__/react/document',
} as const

export interface IViteRailingReactPluginOptions {
  railingConfig: IRailingConfig
  routes: IRailingReactRouteConfig[]
}

function checkHasCustomizeFile(dir: string, name: string) {
  const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']
  return availableExtensions.some(ext => {
    const formattedPath = path.format({ dir, name, ext })
    return fs.existsSync(formattedPath)
  })
}

export function railingReactPlugin(
  opts: IViteRailingReactPluginOptions,
): Plugin {
  return {
    name: 'railing-react',
    resolveId(id, importer, options) {
      switch (id) {
        case railingVirtualModuleIds.app:
          if (checkHasCustomizeFile(userSourceDir, 'app')) {
            return path.join(userSourceDir, 'app')
          }
          return path.join(railingSourceDir, 'app.tsx')
        case railingVirtualModuleIds.document:
          if (checkHasCustomizeFile(userSourceDir, 'document')) {
            return path.join(userSourceDir, 'document')
          }
          return path.join(railingSourceDir, 'document.tsx')
        case railingVirtualModuleIds.config:
        case railingVirtualModuleIds.routes:
          return id
      }
      return null
    },
    load(id) {
      if (railingVirtualModuleIds.routes === id) {
        // const content = opts.routes.map(route => {
        //   return `
        //     {
        //       path: '${route.path}',
        //       // component: require('${route.component}').default
        //       component: null
        //     }
        //   `
        // })

        // return `export default [${content.join(',')}]`
        return 'export default []'
      }
      if (railingVirtualModuleIds.config === id) {
        return `export default ${JSON.stringify(opts.railingConfig)}`
      }
      return null
    },
  }
}
