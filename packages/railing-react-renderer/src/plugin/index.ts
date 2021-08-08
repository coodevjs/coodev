import { IRailingPlugin, IRailing, IWebpackChainConfig } from '@railing/types'
import * as path from 'path'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import type { Compiler } from 'webpack'

export interface IRailingReactRendererPluginOptions {
  template: string
}

export class RailingReactRendererPlugin implements IRailingPlugin {

  private readonly options: IRailingReactRendererPluginOptions
  private railing?: IRailing
  private htmlTemplate?: string

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
  }

  public apply(railing: IRailing) {
    this.railing = railing
    const rootDir = railing.railingConfig.rootDir

    railing.hooks.initializeMiddlewares.tap(
      'RailingReactRendererPlugin',
      middlewares => {
        middlewares.use((req, res, next) => {
          if (req.url === '/') {
            const { renderToHTML } = require(path.join(rootDir, railing.railingConfig.outputDir, 'server', 'app.js'))
            const appString = renderToHTML({ req })
            res.end(this.htmlTemplate?.replace('<!-- ssr outlet -->', appString))
          } else {
            next()
          }
        })
      }
    )

    railing.hooks.clientWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('app')
          .add(path.resolve(__dirname, '../client.js'))
          .end()
        this.addWebpackResolveAlias(config)
        this.addHtmlTemplateListener(config)
      }
    )

    railing.hooks.serverWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('app')
          .add(path.resolve(__dirname, '../server.js'))
          .end()
        this.addWebpackResolveAlias(config)
      }
    )
  }

  private addHtmlTemplateListener(config: IWebpackChainConfig) {
    const emittedFilename = 'index.html'
    config
      .plugin('html-webpack-plugin')
      .use(HtmlWebpackPlugin, [{
        template: this.options.template,
        filename: emittedFilename
      }])

    config.plugin('html-listener')
      .use({
        apply: (compiler: Compiler) => {
          compiler.hooks.assetEmitted.tap(
            'RailingReactRendererPlugin',
            (file, { content }) => {
              if (file === emittedFilename) {
                if (this.railing) {
                  this.htmlTemplate = this.railing.hooks.htmlTemplate.call(content.toString())
                }
              }
            }
          )
        }
      })
  }

  private addWebpackResolveAlias(config: IWebpackChainConfig) {
    const rootDir = this.railing?.railingConfig.rootDir
    if (rootDir) {
      config
        .resolve.alias
        .set('__RAILING__/react/app', path.join(rootDir, 'app'))
        .end()
    }
  }

}