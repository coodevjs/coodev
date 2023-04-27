import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import { networkInterfaces } from 'os'
import type { ViteDevServer } from 'vite'
import { createServer as createViteServer, mergeConfig, build } from 'vite'
import connect from 'connect'
import { loadCoodevConfig } from './coodev-config'
import type {
  InternalConfiguration,
  Renderer,
  CoodevMiddlewares,
  Plugin,
  CoodevOptions,
  BuildOutput,
  BuildEndOptions,
  ViteConfigOptions,
  NextFunction,
  PluginConfiguration,
  Request,
  Response,
  Coodev,
  ViteConfig,
} from './types'

class CoodevImpl implements Coodev {
  public readonly renderer: Renderer
  private _coodevConfig: InternalConfiguration = {} as any
  private readonly _middlewares: CoodevMiddlewares
  private plugins: Plugin[] = []
  private viteServer: ViteDevServer | null = null
  private readonly initializePromise: Promise<void>

  constructor(private readonly options: CoodevOptions) {
    this.renderer = options.renderer
    this._middlewares = connect()

    this.initializePromise = this.initialize(options)
  }

  public get middlewares() {
    return this._middlewares
  }

  public get coodevConfig() {
    return this._coodevConfig
  }

  public async prepare() {
    await this.initializePromise

    const postHooks: (() => void)[] = []
    for (const plugin of this.plugins) {
      if (plugin.configureCoodev) {
        const postHook = plugin.configureCoodev(this)
        if (postHook) {
          postHooks.push(postHook)
        }
      }
    }
    this.middlewares.use((_, res, next) => {
      res.setHeader('X-Powered-By', 'Coodev')
      res.setHeader('Server', 'Coodev')
      next()
    })
    const { dev, ssr, outputDir } = this.coodevConfig

    if (dev) {
      await this.initializeViteServer()
    } else {
      // @ts-ignore
      const { default: serveStatic } = await import('serve-static')

      this.middlewares.use(serveStatic(outputDir))
    }

    if (dev || ssr !== false) {
      this.initializeMiddlewares()
    } else {
      this.middlewares.use((req, res) => {
        // Send index.html for all requests
        res.setHeader('Content-Type', 'text/html')
        const stream = fs.createReadStream(path.join(outputDir, 'index.html'))

        stream.pipe(res)
      })
    }

    for (const postHook of postHooks) {
      postHook()
    }
  }

  public async start() {
    await this.prepare()

    const server = http.createServer(this.middlewares)

    const { port, host } = this.coodevConfig.server

    server.listen(port, host, () => {
      let hostname = host
      if (host === '0.0.0.0') {
        const interfaces = networkInterfaces()
        for (const key in interfaces) {
          const interfaceInfos = interfaces[key]
          if (interfaceInfos) {
            for (const interfaceInfo of interfaceInfos) {
              if (!interfaceInfo.internal && interfaceInfo.family === 'IPv4') {
                hostname = interfaceInfo.address
                break
              }
            }
          }
        }
      }

      console.log(`> Coodev server is running on http://${hostname}:${port}`)
    })
  }

  public async build() {
    await this.initializePromise

    const postHooks: (() => void)[] = []
    for (const plugin of this.plugins) {
      if (plugin.configureCoodev) {
        const postHook = plugin.configureCoodev(this)
        if (postHook) {
          postHooks.push(postHook)
        }
      }
    }

    // TODO: optimize the build process
    for (const postHook of postHooks) {
      postHook()
    }

    const coodevConfig = this.coodevConfig

    const ssr = coodevConfig.ssr !== false
    const serverConfig = await this.callViteConfigHooks({
      ssr,
      dev: false,
      isServer: true,
      isClient: false,
    })
    // Build server side
    const serverBuildOutput = (await build(serverConfig)) as BuildOutput

    await this.callBuildEndHook(
      {
        ssr,
        isServer: true,
        isClient: false,
      },
      serverBuildOutput,
    )

    // Build client side
    const clientConfig = await this.callViteConfigHooks({
      ssr,
      dev: false,
      isServer: false,
      isClient: true,
    })

    const clientBuildOutput = (await build(clientConfig)) as BuildOutput

    await this.callBuildEndHook(
      {
        ssr,
        isServer: false,
        isClient: true,
      },
      clientBuildOutput,
    )
  }

  public async getDocumentHtml(): Promise<string> {
    const documentHtml = await this.renderer.getDocumentHtml(this, {
      next: () => {
        throw new Error('next() is not supported in build mode')
      },
    })

    return this.callDocumentHtmlHooks(documentHtml)
  }

  public async loadSSRModule<T extends Record<string, any>>(
    module: string,
  ): Promise<T> {
    if (!this.viteServer) {
      throw new Error('Vite server is not initialized')
    }
    return this.viteServer.ssrLoadModule(module) as any
  }

  private async initialize(options: CoodevOptions) {
    this._coodevConfig = await loadCoodevConfig({
      root: options.root,
      dev: options.dev,
      ssr: options.ssr,
      server: {
        port: options.port,
        host: options.host,
      },
    })

    this.plugins = this.normalizePlugins(this.coodevConfig.plugins)
  }

  private async callBuildEndHook(
    options: BuildEndOptions,
    output: BuildOutput,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.buildEnd) {
        await plugin.buildEnd(options, output)
      }
    }
  }

  private async callViteConfigHooks(
    options: ViteConfigOptions,
  ): Promise<ViteConfig> {
    const coodevConfig = this.coodevConfig

    let config: ViteConfig = {
      root: coodevConfig.root,
      base: coodevConfig.publicPath,
      clearScreen: true,
      build: {
        outDir: coodevConfig.outputDir,
      },
    }
    for (const plugin of this.plugins) {
      if (plugin.viteConfig) {
        const res = await plugin.viteConfig(options, config)
        if (res) {
          config = mergeConfig(config, res)
        }
      }
    }

    return mergeConfig(config, {
      configFile: false,
      appType: 'custom',
      server: {
        middlewareMode: true,
        fs: {
          strict: false,
        },
      },
    })
  }

  private async callHtmlRenderedHooks(_html: string) {
    let html = _html
    for (const plugin of this.plugins) {
      if (plugin.htmlRendered) {
        const res = await plugin.htmlRendered(html)
        if (res) {
          html = res
        }
      }
    }

    return html
  }

  private async callDocumentHtmlHooks(documentHtml: string) {
    let html = documentHtml
    for (const plugin of this.plugins) {
      if (plugin.documentHtml) {
        const res = await plugin.documentHtml(html)
        if (res) {
          html = res
        }
      }
    }

    return html
  }

  private normalizePlugins(plugins: PluginConfiguration[]): Plugin[] {
    const normalizedPlugins: Plugin[] = []

    for (const plugin of plugins) {
      if (Array.isArray(plugin)) {
        normalizedPlugins.push(...plugin)
      } else {
        normalizedPlugins.push(plugin)
      }
    }

    return normalizedPlugins
  }

  private async initializeViteServer() {
    const coodevConfig = this.coodevConfig
    const viteConfig = await this.callViteConfigHooks({
      ssr: coodevConfig.ssr !== false,
      dev: coodevConfig.dev,
      isClient: true,
      isServer: true,
    })

    this.viteServer = await createViteServer(viteConfig)

    this.middlewares.use(this.viteServer.middlewares)
  }

  private initializeMiddlewares() {
    const ssr = this.coodevConfig.ssr

    if (ssr === false) {
      this.middlewares.use(this._getDocumentHtml.bind(this))
      return
    }

    if (typeof ssr === 'object' && ssr.streamingHtml) {
      this.middlewares.use(this.renderToStream.bind(this))
      return
    }

    this.middlewares.use(this.renderToString.bind(this))
  }

  private async renderToStream(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (err?: any) => {
      hasCalledNext = true
      next(err)
    }

    const stream = await this.renderer.renderToStream(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext || res.writableEnded) {
      return
    }

    stream.pipe(res)
  }

  private async renderToString(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (err?: any) => {
      hasCalledNext = true
      next(err)
    }

    const html = await this.renderer.renderToString(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext || res.writableEnded) {
      return
    }

    if (html == null) {
      console.warn()
      next()
    } else {
      const result = await this.callHtmlRenderedHooks(html)
      res.end(result)
    }
  }

  private async _getDocumentHtml(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let hasCalledNext = false

    const wrappedNext = (err?: any) => {
      hasCalledNext = true
      next(err)
    }

    const documentHtml = await this.renderer.getDocumentHtml(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext) {
      return
    }
    const result = await this.callDocumentHtmlHooks(documentHtml)

    res.end(result)
  }
}

export function createCoodev(options: CoodevOptions) {
  return new CoodevImpl(options)
}
