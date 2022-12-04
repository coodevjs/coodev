import * as connect from 'connect'
import { loadCoodevConfig } from './coodev-config'
import { WaterfallHook } from './libs/hooks'

abstract class Coodev implements Coodev.Coodev {
  public readonly renderer: Coodev.Renderer
  private readonly _hooks: Coodev.CoodevHooks
  private readonly _coodevConfig: Coodev.InternalConfiguration
  private readonly _middlewares: Coodev.CoodevMiddlewares

  constructor(options: Coodev.CoodevOptions) {
    this._hooks = {
      // TODO 增加 isDev / isSSR 的参数
      documentHtml: new WaterfallHook(),
      htmlRendered: new WaterfallHook(),
      stream: new WaterfallHook(),
      viteConfig: new WaterfallHook(),
      buildCompleted: new WaterfallHook(),
    }

    this.renderer = options.renderer

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

  public abstract build(): void

  public abstract loadSSRModule<Module>(path: string): Promise<Module>
}

export default Coodev
