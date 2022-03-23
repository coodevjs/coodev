import {
  IRailingPlugin,
  IRailing,
  IWebpackChainConfig,
  IRailingConfig,
} from '@railing/types'
import * as path from 'path'
import * as fs from 'fs'
import { IRailingReactRouteConfig } from './types'
import RailingReactRenderer from './renderer'

export interface IRailingReactRendererPluginOptions {
  routes?: IRailingReactRouteConfig[]
}

export class RailingReactRendererPlugin implements IRailingPlugin {
  private readonly options: IRailingReactRendererPluginOptions
  private railingConfig: IRailingConfig

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
    this.railingConfig = {}
  }

  public apply(railing: IRailing) {
    this.railingConfig = railing.railingConfig

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
    if (this.checkFileIsExist(path.join(rootDir, 'src'), 'app')) {
      config.resolve.alias
        .set('__RAILING__/react/app', path.join(rootDir, 'src', 'app'))
        .end()
    } else {
      config.resolve.alias
        .set('__RAILING__/react/app', path.resolve(__dirname, './app'))
        .end()
    }

    if (this.checkFileIsExist(path.join(rootDir, 'src'), 'document')) {
      config.resolve.alias
        .set(
          '__RAILING__/react/document',
          path.join(rootDir, 'src', 'document'),
        )
        .end()
    } else {
      config.resolve.alias
        .set(
          '__RAILING__/react/document',
          path.resolve(__dirname, './document'),
        )
        .end()
    }
  }

  private checkFileIsExist(dir: string, name: string) {
    const availableExtensions = ['.tsx', '.ts', '.jsx', '.js']
    return availableExtensions.some(ext => {
      const formattedPath = path.format({ dir, name, ext })
      return fs.existsSync(formattedPath)
    })
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

    options.plugins.unshift([
      path.resolve(__dirname, './babel/babel-plugin-railing-config'),
      {
        railingConfig: {
          dev: this.railingConfig.dev,
          ssr: this.railingConfig.ssr,
        },
      },
    ])

    babelLoaderConfig.set('options', options)
  }
}
