import type {
  IRailingRenderer,
  IRailingRenderContext,
  IRailing,
} from '@railing/types'
import type { IServerEntryModule, IRailingReactRouteConfig } from './types'
import { CONTENT_REPLACEMENT } from './constants'
import { getDefaultDocumentHtml } from './html'
import * as path from 'path'

class RailingReactRenderer implements IRailingRenderer {
  private railing: IRailing | null
  private serverEntryPath: string | null
  private ssr: boolean
  private routes: IRailingReactRouteConfig[]

  constructor() {
    this.serverEntryPath = null
    this.railing = null
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

  public getDocumentHtml(
    context: IRailingRenderContext,
  ): Promise<string> | string {
    if (this.ssr) {
      return this.getSSRDocumentHtml(context)
    }
    return this.getCSRDocumentHtml(context)
  }

  public async render(
    documentHtml: string,
    { req, res, next }: IRailingRenderContext,
  ) {
    if (!this.ssr) {
      return documentHtml
    }
    if (!this.railing || !this.serverEntryPath) {
      return null
    }

    const { renderToHtml } = this.getServerEntryModule()
    const appString = await renderToHtml({ req, res, next })
    return documentHtml.replace(CONTENT_REPLACEMENT, appString)
  }

  private getServerEntryModule() {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
    return require(this.serverEntryPath) as IServerEntryModule
  }

  public getSSRDocumentHtml(context: IRailingRenderContext) {
    const { getDocumentHtml } = this.getServerEntryModule()

    return getDocumentHtml(context)
  }

  public getCSRDocumentHtml(context: IRailingRenderContext) {
    return getDefaultDocumentHtml().replace(CONTENT_REPLACEMENT, '')
  }
}

export default RailingReactRenderer
