import type {
  IRailingRenderer,
  IRailingRenderContext,
  IRailing,
} from '@railing/types'
import type { IServerEntryModule } from './types'
import type { Compiler } from 'webpack'
import { EMITTED_HTML_FILENAME } from './constants'
import * as path from 'path'

class RailingReactRenderer implements IRailingRenderer {
  private railing: IRailing | null
  private htmlTemplate: string
  private serverEntryPath: string | null

  constructor() {
    this.htmlTemplate = ''
    this.serverEntryPath = null
    this.railing = null
  }

  public initialize(railing: IRailing) {
    this.railing = railing

    const { rootDir, outputDir } = railing.railingConfig
    this.serverEntryPath = path.join(rootDir, outputDir, 'server', 'main.js')

    if (railing.railingConfig.dev) {
      railing.hooks.clientWebpackConfig.tap('RailingReactRenderer', config => {
        config.plugin('html-emitted').use({
          apply: (compiler: Compiler) => {
            compiler.hooks.assetEmitted.tap(
              'RailingReactRendererPlugin',
              (file, { content }) => {
                if (file === EMITTED_HTML_FILENAME) {
                  this.htmlTemplate = railing.hooks.documentHtml.call(
                    content.toString(),
                  )
                }
              },
            )
          },
        })
      })
    }
  }

  public getDocumentHtml(context: IRailingRenderContext): Promise<string> {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
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
    return this.htmlTemplate.replace('<!-- ssr outlet -->', appString)
  }

  private getServerEntryModule() {
    if (!this.serverEntryPath) {
      throw new Error('No server entry path')
    }
    return require(this.serverEntryPath) as IServerEntryModule
  }
}

export default RailingReactRenderer
