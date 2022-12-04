import * as path from 'path'
import * as fs from 'fs'
import react from '@vitejs/plugin-react'
import { mergeConfig } from 'vite'
import { coodevReact, ssrRefresh } from './plugins'

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
      (config: Coodev.ViteConfig) => {
        const routes = userRoutes ?? this.parseRouteConfig(root)

        return mergeConfig(config, {
          plugins: [
            react(),
            coodevReact({
              root,
              routes,
              coodevConfig: {
                ssr,
                dev,
                runtimeConfig,
                routing,
                outputDir,
              },
            }),
            ssrRefresh(),
          ],
        })
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
