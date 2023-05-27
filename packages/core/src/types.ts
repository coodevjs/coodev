import type { NextFunction, Server as CoodevMiddlewares } from 'connect'
import type {
  IncomingMessage as Request,
  ServerResponse as Response,
} from 'http'
import type { UserConfig as ViteConfig } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'

export { CoodevMiddlewares, NextFunction, Request, Response, ViteConfig }
export type SSRConfig = boolean | { streamingHtml?: boolean }

export type BuildOutput = RollupOutput | RollupOutput[] | RollupWatcher

export interface RenderContext {
  req: Request
  res: Response
  next: NextFunction
  coodevConfig: InternalConfiguration
}

export interface DocumentHtmlRenderContext {
  req?: Request
  res?: Response
  next: NextFunction
  coodevConfig: InternalConfiguration
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

export interface Hooks {
  // configureCoodev 里面配置 middleware 会在 Coodev 内置 middleware 之前执行
  // 返回一个函数，会在 Coodev 内置 middleware 之后执行
  config?(
    config: InternalConfiguration,
  ): Promisable<void | InternalConfiguration>
  configResolved?(config: InternalConfiguration): Promisable<void>
  configureCoodev?(coodev: Coodev): void | (() => void)
  buildEnd?(options: BuildEndOptions, output: BuildOutput): Promisable<void>
  documentHtml?(html: string): Promisable<void | string>
  htmlRendered?(html: string): Promisable<void | string>
  viteConfig?(
    options: ViteConfigOptions,
    config: ViteConfig,
  ): Promisable<void | ViteConfig>
}

export interface Plugin extends Hooks {
  enforce?: 'pre' | 'post'
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
  renderToString(coodev: Coodev, context: RenderContext): Promise<string | null>
}

export type PluginConfiguration = Plugin | Plugin[]

export interface CoodevOptions {
  dev?: boolean
  root?: string
  port?: number
  host?: string
  ssr?: SSRConfig
  renderer: Renderer
  plugins?: PluginConfiguration[]
}

export interface Coodev {
  readonly renderer: Renderer
  readonly middlewares: CoodevMiddlewares
  readonly coodevConfig: InternalConfiguration
  prepare(this: Coodev): Promise<void>
  start(this: Coodev): Promise<void>
  build(this: Coodev): Promise<void>
  getDocumentHtml(this: Coodev): Promise<string>
  loadSSRModule<T extends Record<string, any>>(path: string): Promise<T>
}

export interface ServerConfiguration {
  host?: string
  port?: number
}

export interface Configuration {
  // the dir is the root dir of source code
  root?: string
  dev?: boolean
  ssr?: SSRConfig
  srcDir?: string
  outputDir?: string
  plugins?: PluginConfiguration[]
  publicPath?: string
  server?: ServerConfiguration
}

export interface InternalConfiguration extends Required<Configuration> {
  server: Required<ServerConfiguration>
}
