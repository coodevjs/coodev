import { createViteServer } from './vite'
import type { ViteDevServer } from 'vite'
import type { Readable } from 'stream'
import { railingSourceDir } from './constants'
import * as path from 'path'

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

    const isEnableSSR = ssr !== false

    this.vite = await createViteServer({
      root: rootDir,
      ssr: isEnableSSR,
      dev,
      railingConfig: {
        ssr,
        dev,
      },
      routes: this.options.routes ?? [],
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

    const url = context.req.url ?? '/'

    return this.vite.transformIndexHtml(url, html)
  }

  public async renderToString({ req, res, next }: Railing.RenderContext) {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { renderToString } = await this.getServerEntryModule()

    const html = await renderToString({ req, res, next })

    const url = req.url ?? '/'

    return this.vite.transformIndexHtml(url, html)
  }

  public async renderToStream(
    context: Railing.RenderContext,
  ): Promise<Readable> {
    const { renderToStream } = await this.getServerEntryModule()

    const stream = await renderToStream(context)

    return stream as any
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
