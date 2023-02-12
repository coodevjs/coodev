import * as path from 'path'
import type {
  Renderer,
  Coodev,
  DocumentHtmlRenderContext,
  RenderContext,
  PipeableStream,
} from '@coodev/core'
import { COODEV_REACT_SOURCE_DIR } from './constants'

export interface ServerEntryModule {
  getDocumentHtml: (ctx: DocumentHtmlRenderContext) => Promise<string>
  renderToString: (ctx: RenderContext) => Promise<string>
  renderToStream: (ctx: RenderContext) => Promise<PipeableStream>
}

export class CoodevReactRenderer implements Renderer {
  private readonly serverEntryPath: string

  constructor() {
    this.serverEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'server.tsx')
  }

  public async getDocumentHtml(
    coodev: Coodev,
    context: DocumentHtmlRenderContext,
  ): Promise<string> {
    const { getDocumentHtml } = await this.getServerEntryModule(coodev)

    const html = await getDocumentHtml(context)

    return html
  }

  public async renderToString(
    coodev: Coodev,
    { req, res, next }: RenderContext,
  ) {
    const { renderToString } = await this.getServerEntryModule(coodev)

    const html = await renderToString({ req, res, next })

    return html
  }

  public async renderToStream(
    coodev: Coodev,
    context: RenderContext,
  ): Promise<PipeableStream> {
    const { renderToStream } = await this.getServerEntryModule(coodev)

    const stream = await renderToStream(context)

    return stream
  }

  private async getServerEntryModule(coodev: Coodev) {
    if (!coodev.coodevConfig.dev) {
      const entryPath = path.join(coodev.coodevConfig.outputDir, 'server.js')
      return require(entryPath)
    }

    return coodev.loadSSRModule<ServerEntryModule>(this.serverEntryPath)
  }
}
