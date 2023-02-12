import * as path from 'path'
import * as fs from 'fs'
import react from '@vitejs/plugin-react'
import { InlineConfig } from 'vite'
import { coodevReact, ssrRefresh } from './plugins'
import { COODEV_REACT_SOURCE_DIR } from './constants'

function parseRouteConfig(root: string): Coodev.RouteConfig[] {
  const basePath = path.join(root, 'pages')

  if (!fs.existsSync(basePath)) {
    console.warn(`No pages directory found in \`${root}\``)
    return []
  }

  const routes: Coodev.RouteConfig[] = []

  const parseRoutes = (filePath: string) => {
    const stats = fs.lstatSync(filePath)
    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath)
      for (const file of files) {
        const childFilePath = path.join(filePath, file)

        parseRoutes(childFilePath)
      }
    } else if (stats.isFile()) {
      const { ext, name, dir } = path.parse(filePath)
      const availableExtensions = ['.tsx', '.js', '.jsx']
      if (availableExtensions.includes(ext)) {
        const formatted = path.format({
          dir,
          name: name ? name.replace(/^\$/, ':') : name,
          ext,
        })
        const relativePath = path
          .relative(
            basePath,
            name === 'index' ? path.dirname(formatted) : formatted,
          )
          .replace(/\\/g, '/')
          .replace(new RegExp(`${ext}$`), '')

        const normalized = relativePath.startsWith('/')
          ? relativePath
          : '/' + relativePath

        routes.push({
          path: normalized,
          component: filePath,
        })
      }
    }
  }

  parseRoutes(basePath)

  return routes
}

export function coodevReactPlugin(): Coodev.Plugin {
  let coodev: Coodev.Coodev
  return {
    enforce: 'pre',
    configureCoodev(_coodev) {
      coodev = _coodev
    },
    viteConfig: async options => {
      const {
        root,
        ssr,
        dev,
        runtimeConfig,
        routing,
        routes: userRoutes,
        outputDir,
        publicPath,
      } = coodev.coodevConfig
      const routes = userRoutes ?? parseRouteConfig(root)

      const coodevReactConfig: InlineConfig = {
        plugins: [
          react(),
          coodevReact({
            root,
            routes,
            coodevConfig: {
              root,
              ssr,
              dev,
              runtimeConfig,
              routing,
              outputDir,
              publicPath,
            },
          }),
          ssrRefresh(),
        ],
      }

      const clientEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'client.tsx')
      const serverEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'server.tsx')

      if (!options.dev) {
        if (options.isClient) {
          const outputDirName = path.basename(outputDir)
          const dynamicGeneratedHtmlPath = path.join(outputDir, 'main.html')

          const htmlRelativeName = outputDirName + path.sep + 'main.html'

          const relativePath = path
            .relative(root, clientEntryPath)
            .replace(/\\/g, '/')

          const clientInput: Record<string, string> = {
            main: dynamicGeneratedHtmlPath,
          }

          if (ssr) {
            clientInput.client = clientEntryPath
          }
          coodevReactConfig.build = {
            ...coodevReactConfig.build,
            ssr: false,
            manifest: true,
            emptyOutDir: false,
            rollupOptions: {
              input: clientInput,
              plugins: [
                {
                  name: 'coodev-react-plugin',
                  generateBundle(_, bundle) {
                    if (ssr !== false) {
                      delete bundle[htmlRelativeName]
                    } else {
                      bundle[htmlRelativeName].fileName = 'index.html'
                    }
                  },
                  writeBundle(_, bundle) {
                    const manifest = bundle['manifest.json']
                    if (manifest && 'source' in manifest) {
                      manifest.source = (manifest.source as string)
                        .replaceAll(outputDirName + '/main.html', 'index.html')
                        .replaceAll(htmlRelativeName, 'index.html')
                        .replaceAll(relativePath, 'index.html')

                      fs.writeFileSync(
                        path.join(outputDir, 'manifest.json'),
                        manifest.source,
                      )
                    }

                    fs.rmSync(dynamicGeneratedHtmlPath)
                  },
                },
              ],
            },
          }
        } else {
          coodevReactConfig.build = {
            ...coodevReactConfig.build,
            ssr: serverEntryPath,
            emptyOutDir: true,
            lib: {
              entry: serverEntryPath,
              fileName: 'server.js',
              formats: ['cjs'],
            },
          }
        }
      } else {
        coodevReactConfig.build = {
          ...coodevReactConfig.build,
          rollupOptions: {
            ...coodevReactConfig.build?.rollupOptions,
            input: [
              clientEntryPath,
              serverEntryPath,
              ...routes.map(route => route.component),
            ],
          },
        }
      }

      return coodevReactConfig
    },
    async buildEnd(options) {
      if (options!.isServer) {
        const documentHtml = await coodev.getDocumentHtml()

        const dynamicGeneratedHtmlPath = path.join(
          coodev.coodevConfig.outputDir,
          'main.html',
        )
        fs.writeFileSync(dynamicGeneratedHtmlPath, documentHtml)
      }
    },
  }
}
