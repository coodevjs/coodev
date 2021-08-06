import { SyncHook, SyncWaterfallHook } from 'tapable'
import {
  IRailing,
  IRailingOptions,
  IHtmlTemplateSyncHook,
  IHtmlRenderedSyncHook,
  IMiddlewareInitializedSyncHook
} from '@railing/types'

abstract class Railing implements IRailing {
  public readonly options: IRailingOptions
  private readonly htmlTemplateSyncHook: IHtmlTemplateSyncHook
  private readonly htmlRenderedSyncHook: IHtmlRenderedSyncHook
  private readonly middlewareInitializedSyncHook: IMiddlewareInitializedSyncHook

  constructor(options: IRailingOptions) {
    this.options = options
    this.htmlTemplateSyncHook = new SyncWaterfallHook(['html'])
    this.htmlRenderedSyncHook = new SyncWaterfallHook(['html'])
    this.middlewareInitializedSyncHook = new SyncHook(['middlewares'])
  }

  public abstract get middlewares(): any

  public get hooks() {
    return {
      middlewareInitialized: this.middlewareInitializedSyncHook,
      htmlTemplate: this.htmlTemplateSyncHook,
      htmlRendered: this.htmlRenderedSyncHook,
    }
  }

  public abstract start(): void
}

export default Railing