import { HTMLDocument, HTMLScriptElement } from '@railing/document'
import type {
  IRailingRenderer,
  IRailingRenderContext,
  IRailing,
} from '@railing/types'
import type { AssetsInfo } from '@railing/webpack'
import type { ViteDevServer } from 'vite'
import type { IServerEntryModule, IRailingReactRouteConfig } from '../types'
import { railingSourceDir, CONTENT_REPLACEMENT } from './constants'
import * as path from 'path'

class RailingReactRenderer implements IRailingRenderer {
  private railing: IRailing | null
  private serverEntryPath: string | null
  private assetsInfo: AssetsInfo | null
  private ssr: boolean
  private vite: ViteDevServer | null = null
  private routes: IRailingReactRouteConfig[]

  constructor() {
    this.serverEntryPath = null
    this.railing = null
    this.assetsInfo = null
    this.ssr = false
    // TODO routes
    this.routes = []
  }

  public initialize(railing: IRailing) {
    this.railing = railing
    this.ssr = railing.railingConfig.ssr

    this.serverEntryPath = path.join(railingSourceDir, 'server.tsx')
    console.log(this.serverEntryPath)
  }

  public async getDocumentHtml(
    context: IRailingRenderContext,
  ): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }
    const { getDocumentHtml } = await this.getServerEntryModule()

    const html = await getDocumentHtml(context)

    return this.vite.transformIndexHtml(
      context.req.url as string,
      html +
        `<script type="module" src="${path.join(
          railingSourceDir,
          'client.tsx',
        )}"></script>`,
    )
  }

  public async render(
    documentHtml: string,
    { req, res, next }: IRailingRenderContext,
  ) {
    if (!this.ssr) {
      return this.normalizeHtml(documentHtml.replace(CONTENT_REPLACEMENT, ''))
    }

    const { renderToHtml } = await this.getServerEntryModule()

    const appString = await renderToHtml({ req, res, next })

    return this.normalizeHtml(
      documentHtml.replace(CONTENT_REPLACEMENT, appString),
    )
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

  public setViteDevServer(vite: ViteDevServer) {
    this.vite = vite
  }

  private async normalizeHtml(html: string) {
    const document = new HTMLDocument(html)

    if (this.assetsInfo) {
      const { scripts } = await this.assetsInfo

      const body = document.getElementByTagName('body')
      if (!body) {
        throw new Error('`<body/>` not found')
      }
      for (const scriptUrl of scripts) {
        const script = new HTMLScriptElement({
          src: scriptUrl,
          type: 'text/javascript',
        })
        body.appendChild(script)
      }
    }

    return document.toHtml()
  }
}

export default RailingReactRenderer
