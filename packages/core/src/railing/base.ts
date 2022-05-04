import { SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import { loadRailingConfig } from './railing-config'

abstract class Railing implements Railing.Railing {
  public readonly options: Railing.RailingOptions
  private readonly documentHtml: Railing.DocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: Railing.HtmlRenderedSyncWaterfallHook

  private readonly _railingConfig: Railing.InternalConfiguration
  private readonly _middlewares: Railing.RailingMiddlewares

  constructor(options: Railing.RailingOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])

    this._railingConfig = loadRailingConfig()
    this._middlewares = connect()
  }

  public get middlewares() {
    return this._middlewares
  }

  public get railingConfig() {
    return this._railingConfig
  }

  public get hooks() {
    return {
      documentHtml: this.documentHtml,
      htmlRendered: this.htmlRendered,
    }
  }

  public abstract start(): void
}

export default Railing
