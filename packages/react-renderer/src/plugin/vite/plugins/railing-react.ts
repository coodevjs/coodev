import { Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { userSourceDir, railingSourceDir } from '../../constants'
import type { IRailingConfig } from '@railing/types'
import type { IRailingReactRouteConfig } from '../../../types'

const RAILING_CONFIG = '__RAILING__/config'
const RAILING_REACT_ROUTES = '__RAILING__/react/routes'
const RAILING_REACT_APP = '__RAILING__/react/app'
const RAILING_REACT_DOCUMENT = '__RAILING__/react/document'

export interface IViteRailingReactPluginOptions {
  root: string
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
    resolveId(id) {
      switch (id) {
        case RAILING_REACT_APP:
          if (checkHasCustomizeFile(userSourceDir, 'app')) {
            return path.join(userSourceDir, 'app')
          }
          return path.join(railingSourceDir, 'app.tsx')
        case RAILING_REACT_DOCUMENT:
          if (checkHasCustomizeFile(userSourceDir, 'document')) {
            return path.join(userSourceDir, 'document')
          }
          return path.join(railingSourceDir, 'document.tsx')
        case RAILING_REACT_ROUTES:
          return `${RAILING_REACT_ROUTES}.tsx`
        case RAILING_CONFIG:
          return id
      }
      return null
    },
    load(id) {
      if (`${RAILING_REACT_ROUTES}.tsx` === id) {
        const content = opts.routes.map(route => {
          const fullPath = path.resolve(opts.root, route.component)
          const clientPath = path.join(railingSourceDir, 'client.tsx')

          const relativePath = path.relative(clientPath, fullPath)

          return `
            {
              path: '${route.path}',
              component: lazyload(() => import('${relativePath}'))
            }
          `
        })

        return `
        import * as React from 'react'

        function lazyload(loader: () => Promise<{ default: React.ComponentType<any> }>) {
          const LazyComponent = React.lazy(loader)
          const Lazyload: React.FC = (props: any) => {
            return (
              <React.Suspense fallback={<div>Loading</div>}>
                <LazyComponent {...props} />
              </React.Suspense>
            )
          }
          return Lazyload
        }

        export default [${content.join(',')}]
      `
      }
      if (RAILING_CONFIG === id) {
        return `export default ${JSON.stringify(opts.railingConfig)}`
      }
      return null
    },
  }
}
