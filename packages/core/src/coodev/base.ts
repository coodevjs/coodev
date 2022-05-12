import { SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import { loadCoodevConfig } from './coodev-config'

abstract class Coodev implements Coodev.Coodev {
  public readonly options: Coodev.CoodevOptions
  private readonly documentHtml: Coodev.DocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: Coodev.HtmlRenderedSyncWaterfallHook

  private readonly _coodevConfig: Coodev.InternalConfiguration
  private readonly _middlewares: Coodev.CoodevMiddlewares

  constructor(options: Coodev.CoodevOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])

    this._coodevConfig = loadCoodevConfig()
    this._middlewares = connect()
  }

  public get middlewares() {
    return this._middlewares
  }

  public get coodevConfig() {
    return this._coodevConfig
  }

  public get hooks() {
    return {
      documentHtml: this.documentHtml,
      htmlRendered: this.htmlRendered,
    }
  }

  public abstract start(): void
}

export default Coodev
