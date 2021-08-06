import type { SyncHook, SyncWaterfallHook } from 'tapable'
import type { Server } from 'connect'

export type IRuntimeConfig = Record<string, any>

export type IMiddlewareInitializedSyncHook = SyncHook<[Server], void>

export type IHtmlTemplateSyncHook = SyncWaterfallHook<[string], string>

export type IHtmlRenderedSyncHook = SyncWaterfallHook<[string], string>

export interface IRailingPlugin {
  apply(railingServerInstance: IRailing): void
}

export interface IRailingHooks {
  middlewareInitialized: IMiddlewareInitializedSyncHook
  htmlTemplate: IHtmlTemplateSyncHook
  htmlRendered: IHtmlRenderedSyncHook
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