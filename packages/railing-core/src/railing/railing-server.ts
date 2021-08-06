import { IRailingConfig, IRailingOptions, IRailingPlugin } from '@railing/types'
import { createWebpackConfig } from '@railing/scripts'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as connect from 'connect'
import { loadRailingConfig } from '../config'
import DevServer from './dev-server'
import Railing from './base'

class RailingServer extends Railing {

  private devServer?: null | DevServer
  private readonly railingConfig: IRailingConfig
  private readonly internalMiddlewares!: connect.Server

  constructor(options: IRailingOptions) {
    super(options)
    this.railingConfig = loadRailingConfig()
    this.internalMiddlewares = connect()

    this.applyPlugins(this.railingConfig.plugins)
    this.initializeMiddlewares(this.internalMiddlewares)
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

  private applyPlugins(plugins?: IRailingPlugin[]) {
    if (plugins?.length) {
      for (const plugin of plugins) {
        plugin.apply(this)
      }
    }
  }

  private initializeMiddlewares(middlewares: connect.Server) {
    this.hooks.middlewareInitialized.call(middlewares)

    console.log('Creating server middlewares...')
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = WebpackDevMiddleware(compiler, {
      writeToDisk: true
    })

    middlewares.use(devMiddleware)
  }

  private createWebpackCompiler() {
    const clientWebpackConfig = createWebpackConfig(this.railingConfig, {
      isDev: true,
      isServer: false
    })
    if (this.railingConfig.ssr === false) {
      return webpack(clientWebpackConfig)
    }
    const serverWebpackConfig = createWebpackConfig(this.railingConfig, {
      isDev: true,
      isServer: true
    })
    return webpack([clientWebpackConfig, serverWebpackConfig])
  }

}

export default RailingServer