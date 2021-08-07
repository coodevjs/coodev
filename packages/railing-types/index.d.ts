import type { Configuration } from 'webpack'
import type { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server } from 'connect'

export type IRuntimeConfig = Record<string, any>

export type IInitializeMiddlewaresSyncHook = SyncHook<[Server], void>

export type IHtmlTemplateSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IHtmlRenderedSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IWebpackConfigSyncWaterfallHook = SyncWaterfallHook<[Configuration], Configuration>

export interface IRailingPlugin {
  apply(railingServerInstance: IRailing): void
}

export interface IRailingHooks {
  initializeMiddlewares: IInitializeMiddlewaresSyncHook
  htmlTemplate: IHtmlTemplateSyncHook
  htmlRendered: IHtmlRenderedSyncHook
  clientWebpackConfig: IWebpackConfigSyncWaterfallHook
  serverWebpackConfig: IWebpackConfigSyncWaterfallHook
}

export interface IRailingOptions {
  dev?: boolean
}

export interface IRailingStartOptions {
  port?: number
}

export class IRailing {
  constructor(options: IRailingOptions)
  public readonly options: IRailingOptions
  public readonly hooks: IRailingHooks
  public readonly middlewares: any
  public start(options: IRailingStartOptions): void
}

export type IRailingConfigEntry = string | { client?: string, server?: string }

export interface IRailingConfig {
  ssr?: boolean
  entry?: IRailingConfigEntry
  outputDir?: string
  runtimeConfig?: IRuntimeConfig
  plugins?: IRailingPlugin[]
}