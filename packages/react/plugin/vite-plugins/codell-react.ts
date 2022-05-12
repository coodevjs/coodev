import { normalizePath } from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import { userSourceDir, codellSourceDir } from '../constants'
import type { Plugin } from 'vite'

const CODELL_CONFIG = '__CODELL__/config'
const CODELL_REACT_ROUTES = '__CODELL__/react/routes'
const CODELL_REACT_APP = '__CODELL__/react/app'
const CODELL_REACT_DOCUMENT = '__CODELL__/react/document'

const CODELL_RUNTIME_REACT_CLIENT = '/@codell/react/client'

export interface ViteCodellReactPluginOptions {
  root: string
  codellConfig: Codell.Configuration
  routes: Codell.RouteConfig[]
}

function checkHasCustomizeFile(dir: string, name: string) {
  const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']
  return availableExtensions.some(ext => {
    const formattedPath = path.format({ dir, name, ext })
    return fs.existsSync(formattedPath)
  })
}

export function codellReact(opts: ViteCodellReactPluginOptions): Plugin {
  return {
    name: 'codell-react',
    resolveId(id) {
      switch (id) {
        case CODELL_REACT_APP:
          if (checkHasCustomizeFile(userSourceDir, 'app')) {
            return path.join(userSourceDir, 'app')
          }
          return path.join(codellSourceDir, 'app.tsx')
        case CODELL_REACT_DOCUMENT:
          if (checkHasCustomizeFile(userSourceDir, 'document')) {
            return path.join(userSourceDir, 'document')
          }
          return path.join(codellSourceDir, 'document.tsx')
        case CODELL_REACT_ROUTES:
        case CODELL_CONFIG:
          return id
        case CODELL_RUNTIME_REACT_CLIENT:
          return path.join(codellSourceDir, 'client.tsx')
      }

      return null
    },
    load(id) {
      if (CODELL_REACT_ROUTES === id) {
        const clientPath = path.resolve(codellSourceDir, 'client.tsx')

        const content = opts.routes.map(route => {
          const fullPath = path.isAbsolute(route.component)
            ? route.component
            : path.resolve(opts.root, route.component)

          const relativePath = normalizePath(
            path.relative(clientPath, fullPath)
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
      if (CODELL_CONFIG === id) {
        return `export default ${JSON.stringify(opts.codellConfig)}`
      }
      return null
    },
  }
}
