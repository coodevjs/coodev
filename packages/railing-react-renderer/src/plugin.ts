import { IRailingPlugin, IRailing, IWebpackChainConfig } from '@railing/types'
import * as path from 'path'
import { IRailingReactRouteConfig } from './types'
import RailingReactRenderer from './renderer'

export interface IRailingReactRendererPluginOptions {
  routes?: IRailingReactRouteConfig[]
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
        config.entry('main').add(path.resolve(__dirname, './client.js')).end()

        this.addWebpackResolveAlias(config, rootDir)
        this.addBabelLoaderPlugin(config, rootDir)
      },
    )

    railing.hooks.serverWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config.entry('main').add(path.resolve(__dirname, './server.js')).end()

        this.addWebpackResolveAlias(config, rootDir)
        this.addBabelLoaderPlugin(config, rootDir)
      },
    )
  }

  private addWebpackResolveAlias(config: IWebpackChainConfig, rootDir: string) {
    config.resolve.alias
      .set('__RAILING__/react/app', path.join(rootDir, 'src', 'app'))
      .end()
  }

  private addBabelLoaderPlugin(config: IWebpackChainConfig, rootDir: string) {
    const babelLoaderConfig = config.module.rules
      .get('compile')
      .uses.get('babel-loader')

    const options = babelLoaderConfig.get('options')

    options.plugins.unshift([
      path.resolve(__dirname, './babel/babel-plugin-railing-routes'),
      { routes: this.options.routes, rootDir },
    ])

    babelLoaderConfig.set('options', options)
  }
}
