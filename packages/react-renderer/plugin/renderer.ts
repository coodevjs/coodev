import { HTMLDocument, HTMLScriptElement } from '@railing/document'
import type {
  IRailingRenderer,
  IRailingRenderContext,
  IRailing,
} from '@railing/types'
import type { AssetsInfo } from '@railing/webpack'
import type { ViteDevServer } from 'vite'
// import type { IServerEntryModule, IRailingReactRouteConfig } from '../types'
// import { CONTENT_REPLACEMENT } from '../constants'
import * as path from 'path'

type IServerEntryModule = any

const CONTENT_REPLACEMENT = '__RAILING_SSR_OUTLET__'

class RailingReactRenderer implements IRailingRenderer {
  private railing: IRailing | null
  private serverEntryPath: string | null
  private assetsInfo: AssetsInfo | null
  private ssr: boolean
  private vite: ViteDevServer | null = null
  private routes: any[]

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

    const { rootDir, outputDir } = railing.railingConfig
    this.serverEntryPath = path.join(rootDir, outputDir, 'server', 'main.js')
  }

  public async getDocumentHtml(
    context: IRailingRenderContext,
  ): Promise<string> {
    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }
    const serverEntryPath = path.join(__dirname, '..', 'src', 'server.tsx')
    const { getDocumentHtml } = await this.vite.ssrLoadModule(serverEntryPath)

    const html = getDocumentHtml()

    console.log('get document html', html)

    console.log(html)

    return html
  }

  public async render(
    documentHtml: string,
    { req, res, next }: IRailingRenderContext,
  ) {
    if (!this.ssr) {
      return this.normalizeHtml(documentHtml.replace(CONTENT_REPLACEMENT, ''))
    }

    if (!this.railing || !this.serverEntryPath) {
      return null
    }

    if (!this.vite) {
      throw new Error('Vite dev server not initialized')
    }

    const serverEntryPath = path.join(__dirname, '..', 'src', 'server.tsx')
    const { renderToHtml } = await this.vite.ssrLoadModule(serverEntryPath)

    const appString = await renderToHtml({ req, res, next })
    return this.normalizeHtml(
      documentHtml.replace(CONTENT_REPLACEMENT, appString),
    )
  }

  private getServerEntryModule() {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
    return require(this.serverEntryPath) as IServerEntryModule
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
