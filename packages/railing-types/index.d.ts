import * as Config from 'webpack-chain'
import type { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server } from 'connect'

export type IWebpackChainConfig = Config

export type IRuntimeConfig = Record<string, any>

export type IInitializeMiddlewaresSyncHook = SyncHook<[Server]>

export type IHtmlTemplateSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IHtmlRenderedSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IWebpackConfigSyncHook = SyncHook<[IWebpackChainConfig]>

export interface IRailingPlugin {
  apply(railingServerInstance: IRailing): void
}

export interface IRailingHooks {
  initializeMiddlewares: IInitializeMiddlewaresSyncHook
  htmlTemplate: IHtmlTemplateSyncWaterfallHook
  htmlRendered: IHtmlRenderedSyncWaterfallHook
  clientWebpackConfig: IWebpackConfigSyncHook
  serverWebpackConfig: IWebpackConfigSyncHook
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
  public readonly middlewares: Server
  public readonly railingConfig: IInternalRailingConfig
  public start(options: IRailingStartOptions): void
}

export type IRailingConfigEntry = string | { client?: string, server?: string }

export interface IRailingConfig {
  ssr?: boolean
  outputDir?: string
  runtimeConfig?: IRuntimeConfig
  plugins?: IRailingPlugin[]
}

export interface IInternalRailingConfig extends Required<IRailingConfig> {
  rootDir: string;
}