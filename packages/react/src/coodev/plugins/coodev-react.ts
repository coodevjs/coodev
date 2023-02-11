import { normalizePath } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { COODEV_REACT_SOURCE_DIR } from '../constants'
import type { Plugin } from 'vite'

const COODEV_REACT_CONFIG = '__COODEV__/react/config'
const COODEV_REACT_ROUTES = '__COODEV__/react/routes'
const COODEV_REACT_APP = '__COODEV__/react/app'
const COODEV_REACT_DOCUMENT = '__COODEV__/react/document'

const COODEV_RUNTIME_REACT_CLIENT = '/@coodev/react/client'

export interface ViteCoodevReactPluginOptions {
  root: string
  coodevConfig: Coodev.Configuration
  routes: Coodev.RouteConfig[]
}

function findAvailableFile(dir: string, name: string) {
  const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']

  for (const ext of availableExtensions) {
    const formattedPath = path.format({ dir, name, ext })
    if (fs.existsSync(formattedPath)) {
      return formattedPath
    }
  }

  return path.format({ dir: COODEV_REACT_SOURCE_DIR, name, ext: '.tsx' })
}

export function coodevReact(opts: ViteCoodevReactPluginOptions): Plugin {
  return {
    name: 'coodev-react',
    config() {
      return {
        optimizeDeps: {
          exclude: ['@coodev/react'],
        },
      }
    },
    resolveId(id) {
      switch (id) {
        case COODEV_REACT_APP:
          return findAvailableFile(opts.root, 'app')
        case COODEV_REACT_DOCUMENT:
          return findAvailableFile(opts.root, 'document')
        case COODEV_REACT_ROUTES:
        case COODEV_REACT_CONFIG:
          return id
        case COODEV_RUNTIME_REACT_CLIENT:
          return path.join(COODEV_REACT_SOURCE_DIR, 'client.tsx')
      }

      return null
    },
    load(id) {
      if (COODEV_REACT_ROUTES === id) {
        const isLazyLoad = opts.coodevConfig.routing === 'lazy'

        const relativeComponentPath = (componentPath: string) => {
          const fullPath = path.isAbsolute(componentPath)
            ? componentPath
            : path.resolve(opts.root, componentPath)

          const relativePath = normalizePath(path.relative(opts.root, fullPath))

          return '/' + relativePath
        }

        if (isLazyLoad) {
          const content = opts.routes.map(route => {
            const componentPath = relativeComponentPath(route.component)

            return `{
              path: '${route.path}',
              component: lazyload(() => import('${componentPath}'))
            }`
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
              if (!Component.getInitialProps) return
              
              return Component.getInitialProps(props)
            }
  
            return Lazyload
          }

          export default [
            ${content.join(',')}
          ]
          `

          return {
            code,
            map: null,
          }
        }

        const importModules: string[] = []

        const content = opts.routes.map((route, idx) => {
          const componentPath = relativeComponentPath(route.component)

          const moduleName = `CoodevRouteComponent_${idx}`
          importModules.push(`import ${moduleName} from '${componentPath}'`)
          return `{
            path: '${route.path}',
            component: ${moduleName}
          }`
        })

        const code = `
        import * as React from 'react'
        ${importModules.join('\n')}

        export default [
          ${content.join(',')}
        ]
        `

        return {
          code,
          map: null,
        }
      }
      if (COODEV_REACT_CONFIG === id) {
        return `export default ${JSON.stringify(opts.coodevConfig)}`
      }
      return null
    },
  }
}
