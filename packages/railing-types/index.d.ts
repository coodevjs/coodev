import * as Config from 'webpack-chain'
import type { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server, NextFunction } from 'connect'
import type { ServerResponse, IncomingMessage } from 'http'

export type IWebpackChainConfig = Config

export type IRuntimeConfig = Record<string, any>

export type IMiddlewaresInitializedSyncHook = SyncHook<[Server]>

export type IHtmlTemplateSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IHtmlRenderedSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IWebpackConfigSyncHook = SyncHook<[IWebpackChainConfig]>

export interface IRailingPlugin {
  apply(railingServerInstance: IRailing): void
}

export interface IRailingHooks {
  middlewaresInitialized: IMiddlewaresInitializedSyncHook
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
  public setRenderer(renderer: IRailingRenderer): void
}

export type IRailingConfigEntry = string | { client?: string, server?: string }

export interface IRailingConfig {
  dev?: boolean
  ssr?: boolean
  outputDir?: string
  runtimeConfig?: IRuntimeConfig
  plugins?: IRailingPlugin[]
}

export type IRailingMiddlewares = Server

export interface IInternalRailingConfig extends Required<IRailingConfig> {
  rootDir: string
}

export interface IRailingRenderContext {
  req: IncomingMessage
  res: ServerResponse
  next: NextFunction
}

export interface IRailingRenderer {
  initialize(railing: IRailing): void
  render(context: IRailingRenderContext): Promise<string | undefined>
}