import { SyncHook, SyncWaterfallHook } from 'tapable'
import {
  IRailing,
  IRailingOptions,
  IHtmlTemplateSyncWaterfallHook,
  IHtmlRenderedSyncWaterfallHook,
  IInitializeMiddlewaresSyncHook,
  IWebpackConfigSyncHook
} from '@railing/types'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly htmlTemplate: IHtmlTemplateSyncWaterfallHook
  private readonly htmlRendered: IHtmlRenderedSyncWaterfallHook
  private readonly initializeMiddlewares: IInitializeMiddlewaresSyncHook
  private readonly clientWebpackConfig: IWebpackConfigSyncHook
  private readonly serverWebpackConfig: IWebpackConfigSyncHook

  constructor(options: IRailingOptions) {
    this.options = options
    this.htmlTemplate = new SyncWaterfallHook(['html'])
    this.htmlRendered = new SyncWaterfallHook(['html'])
    this.initializeMiddlewares = new SyncHook(['middlewares'])
    this.clientWebpackConfig = new SyncHook(['webpackConfig'])
    this.serverWebpackConfig = new SyncHook(['webpackConfig'])
  }

  public abstract get middlewares(): any

  public get hooks() {
    return {
      initializeMiddlewares: this.initializeMiddlewares,
      htmlTemplate: this.htmlTemplate,
      htmlRendered: this.htmlRendered,
      clientWebpackConfig: this.clientWebpackConfig,
      serverWebpackConfig: this.serverWebpackConfig
    }
  }

  public abstract start(): void
}

export default Railing