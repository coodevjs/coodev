import { SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import { loadCoodevConfig } from './coodev-config'

abstract class Coodev implements Coodev.Coodev {
  private readonly _hooks: Coodev.CoodevHooks
  private readonly _coodevConfig: Coodev.InternalConfiguration
  private readonly _middlewares: Coodev.CoodevMiddlewares

  constructor(options: Coodev.CoodevOptions) {
    this._hooks = {
      documentHtml: new SyncWaterfallHook(['html']),
      htmlRendered: new SyncWaterfallHook(['html']),
      stream: new SyncWaterfallHook(['stream']),
      viteConfig: new SyncWaterfallHook(['viteConfig']),
    }

    this._coodevConfig = loadCoodevConfig({
      dev: options.dev,
      ssr: options.ssr,
      plugins: options.plugins,
    })
    this._middlewares = connect()
  }

  public get middlewares() {
    return this._middlewares
  }

  public get coodevConfig() {
    return this._coodevConfig
  }

  public get hooks() {
    return this._hooks
  }

  public abstract start(): void

  public abstract loadSSRModule<Module>(path: string): Promise<Module>
}

export default Coodev
