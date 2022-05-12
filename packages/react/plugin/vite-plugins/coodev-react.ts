import { normalizePath } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { userSourceDir, coodevSourceDir } from '../constants'
import type { Plugin } from 'vite'

const COODEV_CONFIG = '__COODEV__/config'
const COODEV_REACT_ROUTES = '__COODEV__/react/routes'
const COODEV_REACT_APP = '__COODEV__/react/app'
const COODEV_REACT_DOCUMENT = '__COODEV__/react/document'

const COODEV_RUNTIME_REACT_CLIENT = '/@coodev/react/client'

export interface ViteCoodevReactPluginOptions {
  root: string
  coodevConfig: Coodev.Configuration
  routes: Coodev.RouteConfig[]
}

function checkHasCustomizeFile(dir: string, name: string) {
  const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']
  return availableExtensions.some(ext => {
    const formattedPath = path.format({ dir, name, ext })
    return fs.existsSync(formattedPath)
  })
}

export function coodevReact(opts: ViteCoodevReactPluginOptions): Plugin {
  return {
    name: 'coodev-react',
    resolveId(id) {
      switch (id) {
        case COODEV_REACT_APP:
          if (checkHasCustomizeFile(userSourceDir, 'app')) {
            return path.join(userSourceDir, 'app')
          }
          return path.join(coodevSourceDir, 'app.tsx')
        case COODEV_REACT_DOCUMENT:
          if (checkHasCustomizeFile(userSourceDir, 'document')) {
            return path.join(userSourceDir, 'document')
          }
          return path.join(coodevSourceDir, 'document.tsx')
        case COODEV_REACT_ROUTES:
        case COODEV_CONFIG:
          return id
        case COODEV_RUNTIME_REACT_CLIENT:
          return path.join(coodevSourceDir, 'client.tsx')
      }

      return null
    },
    load(id) {
      if (COODEV_REACT_ROUTES === id) {
        const clientPath = path.resolve(coodevSourceDir, 'client.tsx')

        const content = opts.routes.map(route => {
          const fullPath = path.isAbsolute(route.component)
            ? route.component
            : path.resolve(opts.root, route.component)

          const relativePath = normalizePath(
            path.relative(clientPath, fullPath),
          )

          return `
            {
              path: '${route.path}',
              component: lazyload(() => import('${relativePath}'))
            }
          `
        })

        const code = `
        import * as React from 'react'

        function lazyload(loader) {
          const LazyComponent = React.lazy(loader)
          
          const Lazyload = (props) => {
            return React.createElement(
              React.Suspense, 
              { 
                fallback: React.createElement('div', {}, 'Loading...')
              },
              React.createElement(LazyComponent, props)
            )
          }

          Lazyload.getInitialProps = async (props) => {
            const Component = (await loader()).default
            
            return Component.getInitialProps(props)
          }

          return Lazyload
        }

        export default [${content.join(',')}]
      `
        return {
          code,
          map: null,
        }
      }
      if (COODEV_CONFIG === id) {
        return `export default ${JSON.stringify(opts.coodevConfig)}`
      }
      return null
    },
  }
}
