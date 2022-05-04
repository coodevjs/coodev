import * as path from 'path'
import react from '@vitejs/plugin-react'
import { createServer as createViteServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { railingReact, ssrRefresh } from './vite-plugins'
import { railingSourceDir } from './constants'

export interface RailingReactRendererPluginOptions {
  routes?: Railing.RouteConfig[]
}

export class RailingReactRendererPlugin implements Railing.RendererPlugin {
  public readonly enforce = 'pre'
  public readonly __IS_RENDERER_PLUGIN__ = true

  private readonly options: RailingReactRendererPluginOptions
  private serverEntryPath: string | null
  private vite: ViteDevServer | null = null

  constructor(options: RailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
    this.serverEntryPath = null
  }

  public async apply(railing: Railing.Railing) {
    const { rootDir, ssr, dev } = railing.railingConfig

    this.serverEntryPath = path.join(railingSourceDir, 'server.tsx')

    this.vite = await createViteServer({
      root: rootDir,
      clearScreen: true,
      plugins: [
        react(),
        railingReact({
          root: rootDir,
          routes: this.options.routes || [],
          railingConfig: {
            ssr,
            dev,
          },
        }),
        ssrRefresh(),
      ],
      configFile: false,
      server: {
        middlewareMode: 'ssr',
      },
    })

    railing.middlewares.use(this.vite.middlewares)
  }

  public async getDocumentHtml(
    context: Railing.RenderContext,
  ): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { getDocumentHtml } = await this.getServerEntryModule()

    const html = await getDocumentHtml(context)

    return html
  }

  public async renderToString({ req, res, next }: Railing.RenderContext) {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { renderToString } = await this.getServerEntryModule()

    const html = await renderToString({ req, res, next })

    return html
  }

  public async renderToStream(
    context: Railing.RenderContext,
  ): Promise<Railing.Pipeable> {
    const { renderToStream } = await this.getServerEntryModule()

    const stream = await renderToStream(context)

    return stream
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
    ) as Promise<Railing.ServerEntryModule>
  }
}
