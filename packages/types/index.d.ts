namespace Coodev {
  type SyncWaterfallHook = import('tapable').SyncWaterfallHook

  export type RuntimeConfig = Record<string, any>

  export type CoodevMiddlewares = import('connect').Server

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
    apply(coodev: Coodev): Promise<void> | void
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

  export interface CoodevHooks {
    documentHtml: DocumentHtmlSyncWaterfallHook
    htmlRendered: HtmlRenderedSyncWaterfallHook
  }

  export interface CoodevOptions {
    dev?: boolean
  }

  export interface CoodevStartOptions {
    port?: number
  }

  export class Coodev {
    constructor(options: CoodevOptions)
    public readonly options: CoodevOptions
    public readonly hooks: CoodevHooks
    public readonly middlewares: CoodevMiddlewares
    public readonly coodevConfig: InternalCoodevConfig
    public start(options: CoodevStartOptions): void
  }

  export interface Configuration {
    dev?: boolean
    ssr?: boolean | { streamingHtml?: boolean }
    outputDir?: string
    runtimeConfig?: RuntimeConfig
    plugins?: CoodevPlugin[]
  }

  export interface InternalConfiguration extends Required<Configuration> {
    rootDir: string
  }
}
