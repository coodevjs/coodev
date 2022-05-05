import { normalizePath } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { userSourceDir, railingSourceDir } from '../constants'
import type { Plugin } from 'vite'

const RAILING_CONFIG = '__RAILING__/config'
const RAILING_REACT_ROUTES = '__RAILING__/react/routes'
const RAILING_REACT_APP = '__RAILING__/react/app'
const RAILING_REACT_DOCUMENT = '__RAILING__/react/document'

const RAILING_RUNTIME_REACT_CLIENT = '/@railing/react/client'

export interface ViteRailingReactPluginOptions {
  root: string
  railingConfig: Railing.Configuration
  routes: Railing.RouteConfig[]
}

function checkHasCustomizeFile(dir: string, name: string) {
  const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']
  return availableExtensions.some(ext => {
    const formattedPath = path.format({ dir, name, ext })
    return fs.existsSync(formattedPath)
  })
}

export function railingReact(opts: ViteRailingReactPluginOptions): Plugin {
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
        case RAILING_CONFIG:
          return id
        case RAILING_RUNTIME_REACT_CLIENT:
          return path.join(railingSourceDir, 'client.tsx')
      }

      return null
    },
    load(id) {
      if (RAILING_REACT_ROUTES === id) {
        const clientPath = path.resolve(railingSourceDir, 'client.tsx')

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
      if (RAILING_CONFIG === id) {
        return `export default ${JSON.stringify(opts.railingConfig)}`
      }
      return null
    },
  }
}
