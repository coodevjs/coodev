import { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server } from 'connect'
import type {
  IRailing,
  IRailingOptions,
  IHtmlTemplateSyncWaterfallHook,
  IHtmlRenderedSyncWaterfallHook,
  IMiddlewaresInitializedSyncHook,
  IWebpackConfigSyncHook,
  IInternalRailingConfig,
  IRailingRenderer
} from '@railing/types'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly htmlTemplate: IHtmlTemplateSyncWaterfallHook
  private readonly htmlRendered: IHtmlRenderedSyncWaterfallHook
  private readonly middlewaresInitialized: IMiddlewaresInitializedSyncHook
  private readonly clientWebpackConfig: IWebpackConfigSyncHook
  private readonly serverWebpackConfig: IWebpackConfigSyncHook

  constructor(options: IRailingOptions) {
    this.options = options
    this.htmlTemplate = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])
    this.middlewaresInitialized = new SyncHook(['middlewares'])
    this.clientWebpackConfig = new SyncHook(['webpackConfig'])
    this.serverWebpackConfig = new SyncHook(['webpackConfig'])
  }

  public abstract get middlewares(): Server

  public abstract get railingConfig(): IInternalRailingConfig

  public get hooks() {
    return {
      middlewaresInitialized: this.middlewaresInitialized,
      htmlTemplate: this.htmlTemplate,
      htmlRendered: this.htmlRendered,
      clientWebpackConfig: this.clientWebpackConfig,
      serverWebpackConfig: this.serverWebpackConfig
    }
  }

  public abstract start(): void

  public abstract setRenderer(renderer: IRailingRenderer): void
}

export default Railing