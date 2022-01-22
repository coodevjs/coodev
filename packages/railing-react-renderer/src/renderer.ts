import type {
  IRailingRenderer,
  IRailingRenderContext,
  IRailing,
} from '@railing/types'
import type { IServerEntryModule } from './types'
import { CONTENT_REPLACEMENT } from './constants'
import * as path from 'path'

class RailingReactRenderer implements IRailingRenderer {
  private railing: IRailing | null
  private serverEntryPath: string | null

  constructor() {
    this.serverEntryPath = null
    this.railing = null
  }

  public initialize(railing: IRailing) {
    this.railing = railing

    const { rootDir, outputDir } = railing.railingConfig
    this.serverEntryPath = path.join(rootDir, outputDir, 'server', 'main.js')
  }

  public getDocumentHtml(context: IRailingRenderContext): Promise<string> {
    const { getDocumentHtml } = this.getServerEntryModule()

    return getDocumentHtml(context)
  }

  public async render(
    documentHtml: string,
    { req, res, next }: IRailingRenderContext,
  ) {
    if (!this.railing || !this.serverEntryPath) {
      return null
    }
    if (req.url !== '/') {
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
}

export default RailingReactRenderer
