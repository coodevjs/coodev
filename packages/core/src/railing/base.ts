import { SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import type {
  IRailing,
  IRailingOptions,
  IDocumentHtmlSyncWaterfallHook,
  IHtmlRenderedSyncWaterfallHook,
  IGlobalDataSyncWaterfallHook,
  IInternalRailingConfig,
  IRailingMiddlewares,
} from '@railing/types'
import { loadRailingConfig } from './railing-config'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly documentHtml: IDocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: IHtmlRenderedSyncWaterfallHook
  private readonly globalDataHook: IGlobalDataSyncWaterfallHook

  private readonly _railingConfig: IInternalRailingConfig
  private readonly _middlewares: IRailingMiddlewares

  constructor(options: IRailingOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])
    this.globalDataHook = new SyncWaterfallHook(['globalData'])

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
      globalData: this.globalDataHook,
    }
  }

  public abstract start(): void
}

export default Railing
