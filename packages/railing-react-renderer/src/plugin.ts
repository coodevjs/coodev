import {
  IRailingPlugin,
  IRailing,
  IRailingConfig,
  IInternalRailingConfig,
} from '@railing/types'
import * as path from 'path'
import * as fs from 'fs'
import {
  createWebpackChainConfig,
  EntrypointAssetsPlugin,
  IWebpackChainConfig,
} from '@railing/webpack'
import { IRailingReactRouteConfig } from './types'
import RailingReactRenderer from './renderer'

export interface IRailingReactRendererPluginOptions {
  routes?: IRailingReactRouteConfig[]
}

export class RailingReactRendererPlugin implements IRailingPlugin {
  private readonly options: IRailingReactRendererPluginOptions
  private readonly renderer: RailingReactRenderer
  private railingConfig: IRailingConfig

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
    this.renderer = new RailingReactRenderer()
    this.railingConfig = {}
  }

  public apply(railing: IRailing) {
    this.railingConfig = railing.railingConfig

    railing.setRenderer(this.renderer)

    railing.hooks.webpackConfig.tap('RailingReactRendererPlugin', () => {
      const clientWebpackConfig = this.createClientWebpackConfig(
        railing.railingConfig,
      )
      const serverWebpackConfig = this.createServerWebpackConfig(
        railing.railingConfig,
      )

      return [clientWebpackConfig, serverWebpackConfig]
    })
  }

  private createClientWebpackConfig(railingConfig: IInternalRailingConfig) {
    const config = createWebpackChainConfig(railingConfig, {
      isDev: true,
      isServer: false,
    })

    config.entry('main').add(path.resolve(__dirname, './client.js')).end()

    config
      .plugin('Railing/EntrypointAssetsPlugin')
      .use(EntrypointAssetsPlugin, [
        {
          onAssetsCallback: assets => {
            this.renderer.setAssetsInfo(assets)
          },
        },
      ])

    this.addWebpackResolveAlias(config, railingConfig.rootDir)
    this.addBabelLoaderPlugin(config, railingConfig.rootDir)

    return config.toConfig()
  }

  private createServerWebpackConfig(railingConfig: IInternalRailingConfig) {
    const config = createWebpackChainConfig(railingConfig, {
      isDev: true,
      isServer: true,
    })

    config.entry('main').add(path.resolve(__dirname, './server.js')).end()

    this.addWebpackResolveAlias(config, railingConfig.rootDir)
    this.addBabelLoaderPlugin(config, railingConfig.rootDir)

    return config.toConfig()
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
