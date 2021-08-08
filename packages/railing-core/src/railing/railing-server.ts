import { IInternalRailingConfig, IRailingOptions, IRailingPlugin } from '@railing/types'
import { createWebpackChainConfig } from '@railing/scripts'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as connect from 'connect'
import { loadRailingConfig } from '../config'
import DevServer from './dev-server'
import Railing from './base'

class RailingServer extends Railing {

  private devServer?: null | DevServer
  private readonly railingConfig: IInternalRailingConfig
  private readonly internalMiddlewares!: connect.Server

  constructor(options: IRailingOptions) {
    super(options)
    this.railingConfig = loadRailingConfig()
    this.internalMiddlewares = connect()

    this.applyPlugins(this.railingConfig.plugins)
    this.doInitializeMiddlewares(this.internalMiddlewares)
  }

  public get middlewares() {
    return this.internalMiddlewares
  }

  public start() {
    if (this.options.dev) {
      this.devServer = new DevServer({
        railingConfig: this.railingConfig,
        middlewares: this.internalMiddlewares
      })

      this.devServer.start()
    } else {
      // createHttpServer()
    }
  }

  private applyPlugins(plugins: IRailingPlugin[]) {
    if (plugins.length) {
      for (const plugin of plugins) {
        plugin.apply(this)
      }
    }
  }

  private doInitializeMiddlewares(middlewares: connect.Server) {
    this.hooks.initializeMiddlewares.call(middlewares)

    console.log('Creating server middlewares...')
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = WebpackDevMiddleware(compiler, {
      writeToDisk: true
    })

    middlewares.use(devMiddleware)
  }

  private createWebpackCompiler() {
    const clientWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: false
    })
    this.hooks.clientWebpackConfig.call(clientWebpackConfig)
    if (this.railingConfig.ssr === false) {
      return webpack(clientWebpackConfig.toConfig())
    }
    const serverWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: true
    })
    this.hooks.serverWebpackConfig.call(serverWebpackConfig)
    return webpack(
      [clientWebpackConfig.toConfig(), serverWebpackConfig.toConfig()]
    )
  }

}

export default RailingServer