declare namespace Coodev {
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

  export interface ViteConfigOptions {
    dev: boolean
    ssr: boolean
    isServer: boolean
    isClient: boolean
  }

  export interface BuildEndOptions {
    ssr: boolean
    isServer: boolean
    isClient: boolean
  }

  export type Promisable<T> = T | Promise<T>

  export interface Plugin {
    enforce?: 'pre' | 'post'
    // configureCoodev 里面配置 middleware 会在 Coodev 内置 middleware 之前执行
    // 返回一个函数，会在 Coodev 内置 middleware 之后执行
    configureCoodev?(coodev: Coodev): void | (() => void)
    buildEnd?(options: BuildEndOptions, output: BuildOutput): Promisable<void>
    documentHtml?(html: string): Promisable<void | string>
    htmlRendered?(html: string): Promisable<void | string>
    viteConfig?(
      options: ViteConfigOptions,
      config: ViteConfig,
    ): Promisable<void | ViteConfig>
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

  export type PluginConfiguration = Plugin | Plugin[]

  export interface CoodevOptions {
    dev?: boolean
    ssr?: SSRConfig
    renderer: Renderer
    plugins?: PluginConfiguration[]
  }

  export interface CoodevStartOptions {
    port?: number
  }

  export class Coodev {
    constructor(options: CoodevOptions)
    public readonly renderer: Renderer
    public readonly middlewares: CoodevMiddlewares
    public readonly coodevConfig: InternalConfiguration
    public start(options: CoodevStartOptions): void
    public getDocumentHtml(): Promise<string>
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
    plugins?: PluginConfiguration[]
    // TODO
    // publicPath?: string
  }

  export interface InternalConfiguration extends Required<Configuration> {
    // the dir is the root dir of the project
    rootDir: string
  }
}
