import * as path from 'path'
import { COODEV_REACT_SOURCE_DIR } from './constants'

export class CoodevReactRenderer implements Coodev.Renderer {
  private readonly serverEntryPath: string | null

  constructor() {
    this.serverEntryPath = path.join(COODEV_REACT_SOURCE_DIR, 'server.tsx')
  }

  public async getDocumentHtml(
    coodev: Coodev.Coodev,
    context: Coodev.RenderContext,
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

    return coodev.loadSSRModule<Coodev.ServerEntryModule>(this.serverEntryPath)
  }
}
