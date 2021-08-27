import type { IRailingRenderer, IRailingRenderContext, IRailing } from '@railing/types'
import type { IServerEntry } from './types'
import type { Compiler } from 'webpack'
import { EMITTED_HTML_FILENAME } from './constants'
import * as path from 'path'

class RailingReactRenderer implements IRailingRenderer {

  private railing?: IRailing
  private htmlTemplate: string

  constructor() {
    this.htmlTemplate = ''
  }

  public initialize(railing: IRailing) {
    this.railing = railing

    if (railing.railingConfig.dev) {
      railing.hooks.clientWebpackConfig.tap(
        'RailingReactRenderer',
        config => {
          config.plugin('html-emitted')
            .use({
              apply: (compiler: Compiler) => {
                compiler.hooks.assetEmitted.tap(
                  'RailingReactRendererPlugin',
                  (file, { content }) => {
                    if (file === EMITTED_HTML_FILENAME) {
                      this.htmlTemplate = railing.hooks.htmlTemplate.call(content.toString())
                    }
                  }
                )
              }
            })
        }
      )
    }
  }

  public async render({ req, res, next }: IRailingRenderContext) {
    if (!this.railing) {
      return
    }
    if (req.url !== '/') {
      return
    }
    const { rootDir, outputDir } = this.railing.railingConfig
    const serverEntryPath = path.join(
      rootDir, outputDir, 'server', 'main.js'
    )
    const { renderToHTML } = require(serverEntryPath) as IServerEntry
    const appString = await renderToHTML({ req, res, next })
    return this.htmlTemplate.replace('<!-- ssr outlet -->', appString)
  }
}

export default RailingReactRenderer