declare namespace Coodev {
  export interface WaterfallHook<T, Options = {}> {
    tap(
      name: string,
      fn: (arg: T, o?: Options) => Promise<T> | T | undefined,
    ): WaterfallHook<T, Options>
    call(arg: T, o?: Options): Promise<T>
  }

  export type NextFunction = import('connect').NextFunction

  export type Request = import('http').IncomingMessage

  export type Response = import('http').ServerResponse

  export type CoodevMiddlewares = import('connect').Server

  export type ViteConfig = import('vite').UserConfig

  export type SSRConfig = boolean | { streamingHtml?: boolean }

  export type BuildOutput =
    | import('rollup').RollupOutput
    | import('rollup').RollupOutput[]
    | import('rollup').RollupWatcher

  export interface RenderContext {
    req: Request
    res: Response
    next: NextFunction
  }

  export interface DocumentHtmlRenderContext {
    req?: Request
    res?: Response
    next: NextFunction
  }

  export interface PipeableStream {
    pipe: (writable: NodeJS.WritableStream) => void
  }

  export interface ViteConfigWaterfallHookOptions {
    dev: boolean
    ssr: boolean
    isServer: boolean
    isClient: boolean
  }

  export interface BuildCompletedWaterfallHookOptions {
    ssr: boolean
    isServer: boolean
    isClient: boolean
  }

  export type DocumentHtmlWaterfallHook = WaterfallHook<string>

  export type BuildCompletedWaterfallHook = WaterfallHook<
    BuildOutput,
    BuildCompletedWaterfallHookOptions
  >

  export type HtmlRenderedWaterfallHook = WaterfallHook<string>

  export type ViteConfigWaterfallHook = WaterfallHook<
    ViteConfig,
    ViteConfigWaterfallHookOptions
  >

  export type PipeableStreamWaterfallHook = WaterfallHook<PipeableStream>

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
      context: DocumentHtmlRenderContext,
    ): Promise<string> | string
    renderToString(
      coodev: Coodev,
      context: RenderContext,
    ): Promise<string | null>
  }

  export interface CoodevHooks {
    documentHtml: DocumentHtmlWaterfallHook
    htmlRendered: HtmlRenderedWaterfallHook
    viteConfig: ViteConfigWaterfallHook
    stream: PipeableStreamWaterfallHook
    buildCompleted: BuildCompletedWaterfallHook
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
    public readonly renderer: Renderer
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
    // TODO
    // publicPath?: string
  }

  export interface InternalConfiguration extends Required<Configuration> {
    // the dir is the root dir of the project
    rootDir: string
  }
}
