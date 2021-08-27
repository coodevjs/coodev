import { IRailingPlugin, IRailing, IWebpackChainConfig } from '@railing/types'
import * as path from 'path'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import { EMITTED_HTML_FILENAME } from './constants'
import RailingReactRenderer from './renderer'

export interface IRailingReactRendererPluginOptions {
  template: string
}

export class RailingReactRendererPlugin implements IRailingPlugin {

  private readonly options: IRailingReactRendererPluginOptions

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
  }

  public apply(railing: IRailing) {
    const { rootDir } = railing.railingConfig

    railing.setRenderer(new RailingReactRenderer())

    railing.hooks.clientWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('main')
          .add(path.resolve(__dirname, './client.js'))
          .end()

        config
          .plugin('html-webpack-plugin')
          .use(HtmlWebpackPlugin, [{
            template: this.options.template,
            filename: EMITTED_HTML_FILENAME
          }])

        this.addWebpackResolveAlias(config, rootDir)
      }
    )

    railing.hooks.serverWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('main')
          .add(path.resolve(__dirname, './server.js'))
          .end()
        this.addWebpackResolveAlias(config, rootDir)
      }
    )
  }

  private addWebpackResolveAlias(config: IWebpackChainConfig, rootDir: string) {
    config
      .resolve.alias
      .set('__RAILING__/react/app', path.join(rootDir, 'src', 'app'))
      .end()
  }

}