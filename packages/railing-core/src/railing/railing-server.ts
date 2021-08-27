import type {
  IInternalRailingConfig,
  IRailingOptions,
  IRailingPlugin,
  IRailingRenderer,
  IRailingMiddlewares
} from '@railing/types'
import type { IncomingMessage, ServerResponse } from 'http'
import * as connect from 'connect'
import { loadRailingConfig } from '../config'
import DevServer from './dev-server'
import Railing from './base'

class RailingServer extends Railing {

  private renderer?: IRailingRenderer
  private devServer?: DevServer
  private readonly internalRailingConfig: IInternalRailingConfig
  private readonly internalMiddlewares: IRailingMiddlewares

  constructor(options: IRailingOptions) {
    super(options)
    this.internalRailingConfig = loadRailingConfig()
    this.internalMiddlewares = connect()

    this.applyPlugins(this.railingConfig.plugins)
    this.initializeMiddlewares(this.internalMiddlewares)

    this.hooks.middlewaresInitialized.call(this.internalMiddlewares)
  }

  public get middlewares() {
    return this.internalMiddlewares
  }

  public get railingConfig() {
    return this.internalRailingConfig
  }

  public start() {
    if (this.options.dev) {
      this.devServer = new DevServer({
        railingConfig: this.internalRailingConfig,
        middlewares: this.internalMiddlewares,
        hooks: this.hooks
      })

      this.devServer.start()
    } else {
      // createHttpServer()
    }
  }

  public setRenderer(renderer: IRailingRenderer) {
    if (!this.renderer) {
      this.renderer = renderer
      this.renderer.initialize(this)
    }
  }

  private applyPlugins(plugins: IRailingPlugin[]) {
    if (plugins.length) {
      for (const plugin of plugins) {
        plugin.apply(this)
      }
    }
  }

  private initializeMiddlewares(middlewares: IRailingMiddlewares) {
    middlewares.use(this.handleRenderToHTML.bind(this))
  }

  private async handleRenderToHTML(
    req: IncomingMessage,
    res: ServerResponse,
    next: connect.NextFunction
  ) {
    if (this.renderer) {
      const html = await this.renderer.render({ req, res, next })
      if (html === undefined) {
        next()
      } else if (!res.writableEnded) {
        res.end(html)
      }
    } else {
      next()
    }
  }

}

export default RailingServer