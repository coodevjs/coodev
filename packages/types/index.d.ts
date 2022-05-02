import type {
  SyncHook,
  SyncWaterfallHook,
  AsyncHook,
  AsyncSeriesHook,
} from 'tapable'
import type { Server, NextFunction } from 'connect'
import type { ServerResponse, IncomingMessage } from 'http'
import type { Readable } from 'stream'

export type IRuntimeConfig = Record<string, any>

export type IRailingMiddlewares = Server

export type INextFunction = NextFunction

export interface IGlobalData {
  runtimeConfig: IRuntimeConfig
  [key: string]: any
}

export type IDocumentHtmlSyncWaterfallHook = SyncWaterfallHook<[string], string>

export type IGlobalDataSyncWaterfallHook = SyncWaterfallHook<
  [IGlobalData],
  IGlobalData
>

export type IHtmlRenderedSyncWaterfallHook = SyncWaterfallHook<[string], string>

export interface IRailingPlugin {
  enforce?: 'pre' | 'post'
  apply(railingServerInstance: IRailing): Promise<void> | void
}

export interface IRailingRendererPlugin extends IRailingPlugin {
  __IS_RENDERER_PLUGIN__: true
  renderToStream(context: IRailingRenderContext): Promise<Readable>
  getDocumentHtml(context: IRailingRenderContext): Promise<string> | string
  renderToString(context: IRailingRenderContext): Promise<string | null>
}

export interface IRailingHooks {
  documentHtml: IDocumentHtmlSyncWaterfallHook
  htmlRendered: IHtmlRenderedSyncWaterfallHook
  globalData: IGlobalDataSyncWaterfallHook
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
  public readonly middlewares: IRailingMiddlewares
  public readonly railingConfig: IInternalRailingConfig
  public start(options: IRailingStartOptions): void
}

export type IRailingConfigEntry = string | { client?: string; server?: string }

export interface IRailingConfig {
  dev?: boolean
  ssr?: boolean | { streamingHtml?: boolean }
  outputDir?: string
  runtimeConfig?: IRuntimeConfig
  plugins?: IRailingPlugin[]
}

export interface IInternalRailingConfig extends Required<IRailingConfig> {
  rootDir: string
}

export interface IRailingRenderContext {
  req: IncomingMessage
  res: ServerResponse
  next: NextFunction
}
