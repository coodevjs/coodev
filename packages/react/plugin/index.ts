import * as path from 'path'
import * as fs from 'fs'
import react from '@vitejs/plugin-react'
import { createServer as createViteServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { codellReact, ssrRefresh } from './vite-plugins'
import { codellSourceDir } from './constants'

export interface CodellReactRendererPluginOptions {
  routes?: Codell.RouteConfig[]
}

export class CodellReactRendererPlugin implements Codell.RendererPlugin {
  public readonly enforce = 'pre'
  public readonly __IS_RENDERER_PLUGIN__ = true

  private readonly options: CodellReactRendererPluginOptions
  private serverEntryPath: string | null
  private vite: ViteDevServer | null = null

  constructor(options: CodellReactRendererPluginOptions = {}) {
    // TODO validate options
    this.options = options
    this.serverEntryPath = null
  }

  public async apply(codell: Codell.Codell) {
    const { rootDir, ssr, dev, runtimeConfig } = codell.codellConfig

    this.serverEntryPath = path.join(codellSourceDir, 'server.tsx')
    const routes = this.getRouteConfig(rootDir)

    this.vite = await createViteServer({
      root: rootDir,
      clearScreen: true,
      plugins: [
        react(),
        codellReact({
          root: rootDir,
          routes,
          codellConfig: {
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

    codell.middlewares.use(this.vite.middlewares)
  }

  public async getDocumentHtml(context: Codell.RenderContext): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { getDocumentHtml } = await this.getServerEntryModule()

    const html = await getDocumentHtml(context)

    return html
  }

  public async renderToString({ req, res, next }: Codell.RenderContext) {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { renderToString } = await this.getServerEntryModule()

    const html = await renderToString({ req, res, next })

    return html
  }

  public async renderToStream(
    context: Codell.RenderContext,
  ): Promise<Codell.PipeableStream> {
    const { renderToStream } = await this.getServerEntryModule()

    const stream = await renderToStream(context)

    return stream
  }

  private getRouteConfig(rootDir: string): Codell.RouteConfig[] {
    if (Array.isArray(this.options.routes)) {
      return this.options.routes
    }

    const basePath = path.join(rootDir, 'src', 'pages')

    if (!fs.existsSync(basePath)) {
      console.warn(`No pages directory found in ${rootDir}`)
      return []
    }

    const routes: Codell.RouteConfig[] = []

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
    ) as Promise<Codell.ServerEntryModule>
  }
}
