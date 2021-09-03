import type {
  IRailingHooks,
  IInternalRailingConfig,
  IRailingMiddlewares
} from '@railing/types'
import { createWebpackChainConfig } from '../webpack'
import * as createWebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as http from 'http'

export interface IDevServerOptions {
  hooks: IRailingHooks
  railingConfig: IInternalRailingConfig
  middlewares: IRailingMiddlewares
}

class DevServer {
  private readonly middlewares: IRailingMiddlewares
  private readonly railingConfig: IInternalRailingConfig
  private readonly hooks: IRailingHooks

  constructor(options: IDevServerOptions) {
    this.middlewares = options.middlewares
    this.railingConfig = options.railingConfig
    this.hooks = options.hooks

    this.initializeMiddlewares(this.middlewares)
  }

  public start() {
    console.log('Starting develop server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('http://localhost:3000')
  }

  private initializeMiddlewares(middlewares: IRailingMiddlewares) {
    console.log('Creating server middlewares...')
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = createWebpackDevMiddleware(compiler, {
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

export default DevServer