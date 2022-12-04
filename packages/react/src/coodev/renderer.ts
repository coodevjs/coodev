import * as path from 'path'
import { COODEV_REACT_SOURCE_DIR } from './constants'

export class CoodevReactRenderer implements Coodev.Renderer {
  public readonly serverEntryPath: string
  public readonly clientEntryPath: string

  constructor() {
    this.serverEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'server.tsx')
    this.clientEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'client.tsx')
  }

  public async getDocumentHtml(
    coodev: Coodev.Coodev,
    context: Coodev.DocumentHtmlRenderContext,
  ): Promise<string> {
    const { getDocumentHtml } = await this.getServerEntryModule(coodev)

    const html = await getDocumentHtml(context)

    return html
  }

  public async renderToString(
    coodev: Coodev.Coodev,
    { req, res, next }: Coodev.RenderContext,
  ) {
    const { renderToString } = await this.getServerEntryModule(coodev)

    const html = await renderToString({ req, res, next })

    return html
  }

  public async renderToStream(
    coodev: Coodev.Coodev,
    context: Coodev.RenderContext,
  ): Promise<Coodev.PipeableStream> {
    const { renderToStream } = await this.getServerEntryModule(coodev)

    const stream = await renderToStream(context)

    return stream
  }

  private async getServerEntryModule(coodev: Coodev.Coodev) {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }

    if (!coodev.coodevConfig.dev) {
      const entryPath = path.join(coodev.coodevConfig.outputDir, 'server.js')
      console.log('entryPath', entryPath)
      return require(entryPath)
    }

    return coodev.loadSSRModule<Coodev.ServerEntryModule>(this.serverEntryPath)
  }
}
