namespace Railing {
  type SyncWaterfallHook = import('tapable').SyncWaterfallHook

  type AsyncHook = import('tapable').AsyncHook

  type AsyncSeriesHook = import('tapable').AsyncSeriesHook

  export type RuntimeConfig = Record<string, any>

  export type RailingMiddlewares = import('connect').Server

  export type NextFunction = import('connect').NextFunction

  export interface RenderContext {
    req: import('http').IncomingMessage
    res: import('http').ServerResponse
    next: NextFunction
  }

  export type DocumentHtmlSyncWaterfallHook = SyncWaterfallHook<
    [string],
    string
  >

  export type HtmlRenderedSyncWaterfallHook = SyncWaterfallHook<
    [string],
    string
  >

  export interface Plugin {
    enforce?: 'pre' | 'post'
    apply(railingServerInstance: Railing): Promise<void> | void
  }

  export interface PipeableStream {
    pipe: (writable: NodeJS.WritableStream) => void
  }

  export interface RendererPlugin extends Plugin {
    __IS_RENDERER_PLUGIN__: true
    renderToStream(context: RenderContext): Promise<PipeableStream>
    getDocumentHtml(context: RenderContext): Promise<string> | string
    renderToString(context: RenderContext): Promise<string | null>
  }

  export interface RailingHooks {
    documentHtml: DocumentHtmlSyncWaterfallHook
    htmlRendered: HtmlRenderedSyncWaterfallHook
  }

  export interface RailingOptions {
    dev?: boolean
  }

  export interface RailingStartOptions {
    port?: number
  }

  export class Railing {
    constructor(options: RailingOptions)
    public readonly options: RailingOptions
    public readonly hooks: RailingHooks
    public readonly middlewares: RailingMiddlewares
    public readonly railingConfig: InternalRailingConfig
    public start(options: RailingStartOptions): void
  }

  export interface Configuration {
    dev?: boolean
    ssr?: boolean | { streamingHtml?: boolean }
    outputDir?: string
    runtimeConfig?: RuntimeConfig
    plugins?: RailingPlugin[]
  }

  export interface InternalConfiguration extends Required<Configuration> {
    rootDir: string
  }
}
