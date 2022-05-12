import { SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import { loadCodellConfig } from './codell-config'

abstract class Codell implements Codell.Codell {
  public readonly options: Codell.CodellOptions
  private readonly documentHtml: Codell.DocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: Codell.HtmlRenderedSyncWaterfallHook

  private readonly _codellConfig: Codell.InternalConfiguration
  private readonly _middlewares: Codell.CodellMiddlewares

  constructor(options: Codell.CodellOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])

    this._codellConfig = loadCodellConfig()
    this._middlewares = connect()
  }

  public get middlewares() {
    return this._middlewares
  }

  public get codellConfig() {
    return this._codellConfig
  }

  public get hooks() {
    return {
      documentHtml: this.documentHtml,
      htmlRendered: this.htmlRendered,
    }
  }

  public abstract start(): void
}

export default Codell
