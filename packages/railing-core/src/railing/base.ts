import { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server } from 'connect'
import type {
  IRailing,
  IRailingOptions,
  IDocumentHtmlSyncWaterfallHook,
  IHtmlRenderedSyncWaterfallHook,
  IMiddlewaresSyncHook,
  IWebpackConfigSyncHook,
  IInternalRailingConfig,
  IRailingRenderer,
} from '@railing/types'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly documentHtml: IDocumentHtmlSyncWaterfallHook
  private readonly htmlRendered: IHtmlRenderedSyncWaterfallHook
  private readonly middlewaresHooks: IMiddlewaresSyncHook
  private readonly clientWebpackConfig: IWebpackConfigSyncHook
  private readonly serverWebpackConfig: IWebpackConfigSyncHook

  constructor(options: IRailingOptions) {
    this.options = options
    this.documentHtml = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])
    this.middlewaresHooks = new SyncHook(['middlewares'])
    this.clientWebpackConfig = new SyncHook(['webpackConfig'])
    this.serverWebpackConfig = new SyncHook(['webpackConfig'])
  }

  public abstract get middlewares(): Server

  public abstract get railingConfig(): IInternalRailingConfig

  public get hooks() {
    return {
      middlewares: this.middlewaresHooks,
      documentHtml: this.documentHtml,
      htmlRendered: this.htmlRendered,
      clientWebpackConfig: this.clientWebpackConfig,
      serverWebpackConfig: this.serverWebpackConfig,
    }
  }

  public abstract start(): void

  public abstract setRenderer(renderer: IRailingRenderer): void
}

export default Railing
