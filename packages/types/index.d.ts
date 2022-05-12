namespace Codell {
  type SyncWaterfallHook = import('tapable').SyncWaterfallHook

  export type RuntimeConfig = Record<string, any>

  export type CodellMiddlewares = import('connect').Server

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
    apply(codell: Codell): Promise<void> | void
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

  export interface CodellHooks {
    documentHtml: DocumentHtmlSyncWaterfallHook
    htmlRendered: HtmlRenderedSyncWaterfallHook
  }

  export interface CodellOptions {
    dev?: boolean
  }

  export interface CodellStartOptions {
    port?: number
  }

  export class Codell {
    constructor(options: CodellOptions)
    public readonly options: CodellOptions
    public readonly hooks: CodellHooks
    public readonly middlewares: CodellMiddlewares
    public readonly codellConfig: InternalCodellConfig
    public start(options: CodellStartOptions): void
  }

  export interface Configuration {
    dev?: boolean
    ssr?: boolean | { streamingHtml?: boolean }
    outputDir?: string
    runtimeConfig?: RuntimeConfig
    plugins?: CodellPlugin[]
  }

  export interface InternalConfiguration extends Required<Configuration> {
    rootDir: string
  }
}
