import { normalizePath } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { COODEV_REACT_SOURCE_DIR } from '../constants'
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
          if (checkHasCustomizeFile(opts.root, 'app')) {
            return path.join(opts.root, 'app')
          }
          return path.join(COODEV_REACT_SOURCE_DIR, 'app.tsx')
        case COODEV_REACT_DOCUMENT:
          if (checkHasCustomizeFile(opts.root, 'document')) {
            return path.join(opts.root, 'document')
          }
          return path.join(COODEV_REACT_SOURCE_DIR, 'document.tsx')
        case COODEV_REACT_ROUTES:
        case COODEV_CONFIG:
          return id
        case COODEV_RUNTIME_REACT_CLIENT:
          return path.join(COODEV_REACT_SOURCE_DIR, 'client.tsx')
      }

      return null
    },
    load(id) {
      if (COODEV_REACT_ROUTES === id) {
        const isLazyLoad = opts.coodevConfig.routing === 'lazy'
        const clientPath = path.resolve(COODEV_REACT_SOURCE_DIR, 'client.tsx')

        const relativeComponentPath = (componentPath: string) => {
          const fullPath = path.isAbsolute(componentPath)
            ? componentPath
            : path.resolve(opts.root, componentPath)

          const relativePath = normalizePath(
            path.relative(clientPath, fullPath),
          )

          return relativePath
        }

        if (isLazyLoad) {
          const content = opts.routes.map((route, idx) => {
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
      if (COODEV_CONFIG === id) {
        return `export default ${JSON.stringify(opts.coodevConfig)}`
      }
      return null
    },
  }
}
