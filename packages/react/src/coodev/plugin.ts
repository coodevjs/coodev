import * as path from 'path'
import * as fs from 'fs'
import react from '@vitejs/plugin-react'
import { InlineConfig, mergeConfig } from 'vite'
import { coodevReact, ssrRefresh } from './plugins'
import { COODEV_REACT_SOURCE_DIR } from './constants'

export class CoodevReactPlugin implements Coodev.Plugin {
  public readonly enforce = 'pre'

  public async apply(coodev: Coodev.Coodev) {
    const {
      root,
      ssr,
      dev,
      runtimeConfig,
      routing,
      routes: userRoutes,
      outputDir,
    } = coodev.coodevConfig

    coodev.hooks.viteConfig.tap(
      'CoodevReactPlugin',
      async (config: Coodev.ViteConfig, _options) => {
        const options = _options as Coodev.ViteConfigWaterfallHookOptions
        const routes = userRoutes ?? this.parseRouteConfig(root)

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
              },
            }),
            ssrRefresh(),
          ],
        }

        if (!options.dev) {
          if (options.isClient) {
            const outputDirName = path.basename(outputDir)
            const dynamicGeneratedHtmlPath = path.join(outputDir, 'main.html')

            const htmlRelativeName = outputDirName + path.sep + 'main.html'
            const clientEntryPath = path.join(
              COODEV_REACT_SOURCE_DIR,
              'client.tsx',
            )
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
                          .replaceAll(
                            outputDirName + '/main.html',
                            'index.html',
                          )
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
            const serverEntryPath = path.join(
              COODEV_REACT_SOURCE_DIR,
              'server.tsx',
            )
            coodevReactConfig.build = {
              ...coodevReactConfig.build,
              ssr: serverEntryPath,
              emptyOutDir: true,
            }
          }
        }

        return mergeConfig(config, coodevReactConfig)
      },
    )

    coodev.hooks.buildCompleted.tap(
      'CoodevReactPlugin',
      async (output, options) => {
        if (options!.isServer) {
          const documentHtml = await coodev.renderer.getDocumentHtml(coodev, {
            next: () => {
              throw new Error('next() is not supported in build mode')
            },
          })

          const html = await coodev.hooks.documentHtml.call(documentHtml)

          const dynamicGeneratedHtmlPath = path.join(outputDir, 'main.html')
          fs.writeFileSync(dynamicGeneratedHtmlPath, html)
        }

        return output
      },
    )
  }

  private parseRouteConfig(root: string): Coodev.RouteConfig[] {
    const basePath = path.join(root, 'pages')

    if (!fs.existsSync(basePath)) {
      console.warn(`No pages directory found in ${root}`)
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
}
