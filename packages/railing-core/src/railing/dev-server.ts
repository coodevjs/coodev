import type {
  IRailingHooks,
  IInternalRailingConfig,
  IRailingMiddlewares,
  IRailingRenderer,
} from '@railing/types'
import { createWebpackChainConfig } from '../webpack'
import type { IncomingMessage, ServerResponse } from 'http'
import * as connect from 'connect'
import * as createWebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as http from 'http'

export interface IDevServerOptions {
  hooks: IRailingHooks
  railingConfig: IInternalRailingConfig
  middlewares: IRailingMiddlewares
  renderer: IRailingRenderer
}

class DevServer {
  private readonly middlewares: IRailingMiddlewares
  private readonly railingConfig: IInternalRailingConfig
  private readonly hooks: IRailingHooks
  private readonly renderer: IRailingRenderer

  constructor(options: IDevServerOptions) {
    this.middlewares = options.middlewares
    this.railingConfig = options.railingConfig
    this.renderer = options.renderer
    this.hooks = options.hooks

    this.initializeMiddlewares(this.middlewares)
  }

  public start() {
    console.log('Starting development server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Railing server listen on http://localhost:3000')
  }

  private initializeMiddlewares(middlewares: IRailingMiddlewares) {
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = createWebpackDevMiddleware(compiler, {
      writeToDisk: true,
    })
    middlewares.use(devMiddleware)
    middlewares.use(this.renderToHtml.bind(this))

    this.hooks.middlewares.call(middlewares)
  }

  private createWebpackCompiler() {
    const clientWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: false,
    })
    this.hooks.clientWebpackConfig.call(clientWebpackConfig)
    if (this.railingConfig.ssr === false) {
      return webpack(clientWebpackConfig.toConfig())
    }
    const serverWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: true,
    })
    this.hooks.serverWebpackConfig.call(serverWebpackConfig)
    return webpack([
      clientWebpackConfig.toConfig(),
      serverWebpackConfig.toConfig(),
    ])
  }

  private async renderToHtml(
    req: IncomingMessage,
    res: ServerResponse,
    next: connect.NextFunction,
  ) {
    let documentHtml = await this.renderer.getDocumentHtml({
      req,
      res,
      next,
    })
    documentHtml = this.hooks.documentHtml.call(documentHtml)
    console.log('document html', documentHtml)
    const html = await this.renderer.render(documentHtml, { req, res, next })
    if (html === null) {
      next()
    } else if (!res.writableEnded) {
      res.end(html)
    }
  }
}

export default DevServer
