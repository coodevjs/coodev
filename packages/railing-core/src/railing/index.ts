import type {
  IInternalRailingConfig,
  IRailingOptions,
  IRailingPlugin,
  IRailingRenderer,
  IRailingMiddlewares,
} from '@railing/types'
import * as connect from 'connect'
import { loadRailingConfig } from '../config'
import DevServer from './dev-server'
import BaseRailing from './base'

class Railing extends BaseRailing {
  private renderer?: IRailingRenderer
  private readonly internalRailingConfig: IInternalRailingConfig
  private readonly internalMiddlewares: IRailingMiddlewares

  constructor(options: IRailingOptions) {
    super(options)
    this.internalRailingConfig = loadRailingConfig()
    this.internalMiddlewares = connect()

    this.applyPlugins(this.railingConfig.plugins)
  }

  public get middlewares() {
    return this.internalMiddlewares
  }

  public get railingConfig() {
    return this.internalRailingConfig
  }

  public start() {
    if (this.options.dev) {
      if (!this.renderer) {
        throw new Error('Please `setRenderer` first before start')
      }
      const devServer = new DevServer({
        railingConfig: this.internalRailingConfig,
        middlewares: this.internalMiddlewares,
        renderer: this.renderer,
        hooks: this.hooks,
      })

      devServer.start()
    } else {
      // createProdServer()
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
}

export default Railing
