import { SyncHook, SyncWaterfallHook } from 'tapable'
import * as connect from 'connect'
import type {
  IRailing,
  IRailingOptions,
  IDocumentHtmlSyncWaterfallHook,
  IHtmlRenderedSyncWaterfallHook,
  IMiddlewaresSyncHook,
  IGlobalDataSyncWaterfallHook,
  IInternalRailingConfig,
  IRailingRenderer,
  IRailingMiddlewares,
} from '@railing/types'
import { loadRailingConfig } from './railing-config'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly documentHtml: IDocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: IHtmlRenderedSyncWaterfallHook
  private readonly middlewaresHooks: IMiddlewaresSyncHook
  private readonly globalDataHook: IGlobalDataSyncWaterfallHook

  private readonly internalRailingConfig: IInternalRailingConfig
  private readonly internalMiddlewares: IRailingMiddlewares

  constructor(options: IRailingOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])
    this.middlewaresHooks = new SyncHook(['middlewares'])
    this.globalDataHook = new SyncWaterfallHook(['globalData'])

    this.internalRailingConfig = loadRailingConfig()
    this.internalMiddlewares = connect()
  }

  public get middlewares() {
    return this.internalMiddlewares
  }

  public get railingConfig() {
    return this.internalRailingConfig
  }

  public get hooks() {
    return {
      middlewares: this.middlewaresHooks,
      documentHtml: this.documentHtml,
      htmlRendered: this.htmlRendered,
      globalData: this.globalDataHook,
    }
  }

  public abstract start(): void

  public abstract setRenderer(renderer: IRailingRenderer): void
}

export default Railing
