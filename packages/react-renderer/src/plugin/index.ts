import {
  IRailingRendererPlugin,
  IRailing,
  IRailingRenderContext,
} from '@railing/types'
import { createViteServer } from './vite'
import { HTMLDocument, HTMLScriptElement } from '@railing/document'
import type { ViteDevServer } from 'vite'
import type { Readable } from 'stream'
import type { IServerEntryModule, IRailingReactRouteConfig } from '../types'
import { railingSourceDir, CONTENT_REPLACEMENT } from './constants'
import * as path from 'path'

export interface IRailingReactRendererPluginOptions {
  routes?: IRailingReactRouteConfig[]
}

export class RailingReactRendererPlugin implements IRailingRendererPlugin {
  public readonly enforce = 'pre'
  public readonly __IS_RENDERER_PLUGIN__ = true
  private readonly options: IRailingReactRendererPluginOptions
  private serverEntryPath: string | null
  private ssr: boolean
  private vite: ViteDevServer | null = null
  private routes: IRailingReactRouteConfig[]

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
    this.serverEntryPath = null
    this.ssr = false
    // TODO routes
    this.routes = []
  }

  public async apply(railing: IRailing) {
    const { rootDir, ssr, dev } = railing.railingConfig
    this.ssr = railing.railingConfig.ssr !== false

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
    context: IRailingRenderContext,
  ): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const { getDocumentHtml } = await this.getServerEntryModule()

    const html = await getDocumentHtml(context)

    const normalized = await this.normalizeHtml(html)

    const url = context.req.url ?? '/'

    return this.vite.transformIndexHtml(url, normalized)
  }

  public async renderToString(
    documentHtml: string,
    { req, res, next }: IRailingRenderContext,
  ) {
    if (!this.ssr) {
      return this.normalizeHtml(documentHtml.replace(CONTENT_REPLACEMENT, ''))
    }

    const { renderToHtml } = await this.getServerEntryModule()

    const appString = await renderToHtml({ req, res, next })

    return documentHtml.replace(CONTENT_REPLACEMENT, appString)
  }

  public async renderToStream(
    context: IRailingRenderContext,
  ): Promise<Readable> {
    const { renderToStream } = await this.getServerEntryModule()

    const stream = await renderToStream(context)

    return stream as any
  }

  private getServerEntryModule() {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }
    return this.vite.ssrLoadModule(
      this.serverEntryPath,
    ) as Promise<IServerEntryModule>
  }

  private async normalizeHtml(html: string) {
    const document = new HTMLDocument(html)

    const body = document.getElementByTagName('body')
    if (!body) {
      throw new Error('`<body/>` not found')
    }
    const script = new HTMLScriptElement({
      src: path.join(railingSourceDir, 'client.tsx'),
      type: 'module',
    })

    body.appendChild(script)

    return document.toHtml()
  }
}
