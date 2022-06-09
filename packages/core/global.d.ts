declare namespace Coodev {
  export interface SyncWaterfallHook<T> {
    tap(name: string, fn: (arg: T) => any): SyncWaterfallHook<T>
    call(arg: T): T
  }

  export type NextFunction = import('connect').NextFunction

  export type Request = import('http').IncomingMessage

  export type Response = import('http').ServerResponse

  export type CoodevMiddlewares = import('connect').Server

  export type ViteConfig = import('vite').UserConfig

  export type SSRConfig = boolean | { streamingHtml?: boolean }

  export interface RenderContext {
    req: Request
    res: Response
    next: NextFunction
  }

  export interface PipeableStream {
    pipe: (writable: NodeJS.WritableStream) => void
  }

  export type DocumentHtmlSyncWaterfallHook = SyncWaterfallHook<string>

  export type HtmlRenderedSyncWaterfallHook = SyncWaterfallHook<string>

  export type ViteConfigSyncWaterfallHook = SyncWaterfallHook<ViteConfig>

  export type PipeableStreamSyncWaterfallHook =
    SyncWaterfallHook<PipeableStream>

  export interface Plugin {
    enforce?: 'pre' | 'post'
    apply(coodev: Coodev): Promise<void> | void
  }

  export interface Renderer {
    renderToStream(
      coodev: Coodev,
      context: RenderContext,
    ): Promise<PipeableStream>
    getDocumentHtml(
      coodev: Coodev,
      context: RenderContext,
    ): Promise<string> | string
    renderToString(
      coodev: Coodev,
      context: RenderContext,
    ): Promise<string | null>
  }

  export interface CoodevHooks {
    documentHtml: DocumentHtmlSyncWaterfallHook
    htmlRendered: HtmlRenderedSyncWaterfallHook
    viteConfig: ViteConfigSyncWaterfallHook
    stream: PipeableStreamSyncWaterfallHook
  }

  export interface CoodevOptions {
    dev?: boolean
    ssr?: SSRConfig
    renderer: Renderer
    plugins?: Plugin[]
  }

  export interface CoodevStartOptions {
    port?: number
  }

  export class Coodev {
    constructor(options: CoodevOptions)
    public readonly hooks: CoodevHooks
    public readonly middlewares: CoodevMiddlewares
    public readonly coodevConfig: InternalConfiguration
    public start(options: CoodevStartOptions): void
    public loadSSRModule<Module extends Record<string, any>>(
      path: string,
    ): Promise<Module>
  }

  export interface Configuration {
    // the dir is the root dir of source code
    root?: string
    dev?: boolean
    ssr?: SSRConfig
    outputDir?: string
    plugins?: CoodevPlugin[]
  }

  export interface InternalConfiguration extends Required<Configuration> {
    // the dir is the root dir of the project
    rootDir: string
  }
}
