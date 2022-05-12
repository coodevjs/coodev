import * as path from 'path'
import * as fs from 'fs'
import react from '@vitejs/plugin-react'
import { createServer as createViteServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { coodevReact, ssrRefresh } from './vite-plugins'
import { coodevSourceDir } from './constants'

export interface CoodevReactRendererPluginOptions {
  routes?: Coodev.RouteConfig[]
}

export class CoodevReactRendererPlugin implements Coodev.RendererPlugin {
  public readonly enforce = 'pre'
  public readonly __IS_RENDERER_PLUGIN__ = true

  private readonly options: CoodevReactRendererPluginOptions
  private serverEntryPath: string | null
  private vite: ViteDevServer | null = null

  constructor(options: CoodevReactRendererPluginOptions = {}) {
    // TODO validate options
    this.options = options
    this.serverEntryPath = null
  }

  public async apply(coodev: Coodev.Coodev) {
    const { rootDir, ssr, dev, runtimeConfig } = coodev.coodevConfig

    this.serverEntryPath = path.join(coodevSourceDir, 'server.tsx')
    const routes = this.getRouteConfig(rootDir)

    this.vite = await createViteServer({
      root: rootDir,
      clearScreen: true,
      plugins: [
        react(),
        coodevReact({
          root: rootDir,
          routes,
          coodevConfig: {
            ssr,
            dev,
            runtimeConfig,
          },
        }),
        ssrRefresh(),
      ],
      configFile: false,
      server: {
        middlewareMode: 'ssr',
      },
    })

    coodev.middlewares.use(this.vite.middlewares)
  }

  public async getDocumentHtml(context: Coodev.RenderContext): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { getDocumentHtml } = await this.getServerEntryModule()

    const html = await getDocumentHtml(context)

    return html
  }

  public async renderToString({ req, res, next }: Coodev.RenderContext) {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { renderToString } = await this.getServerEntryModule()

    const html = await renderToString({ req, res, next })

    return html
  }

  public async renderToStream(
    context: Coodev.RenderContext,
  ): Promise<Coodev.PipeableStream> {
    const { renderToStream } = await this.getServerEntryModule()

    const stream = await renderToStream(context)

    return stream
  }

  private getRouteConfig(rootDir: string): Coodev.RouteConfig[] {
    if (Array.isArray(this.options.routes)) {
      return this.options.routes
    }

    const basePath = path.join(rootDir, 'src', 'pages')

    if (!fs.existsSync(basePath)) {
      console.warn(`No pages directory found in ${rootDir}`)
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
        const { ext, name } = path.parse(filePath)
        const availableExtensions = ['.tsx', '.js', '.jsx']
        if (availableExtensions.includes(ext)) {
          const relativePath = path
            .relative(
              basePath,
              name === 'index' ? path.dirname(filePath) : filePath,
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

  private async getServerEntryModule() {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }
    return this.vite.ssrLoadModule(
      this.serverEntryPath,
    ) as Promise<Coodev.ServerEntryModule>
  }
}
