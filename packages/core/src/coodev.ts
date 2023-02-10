import * as http from 'http'
import {
  ViteDevServer,
  createServer as createViteServer,
  mergeConfig,
  InlineConfig,
  build,
} from 'vite'
import * as connect from 'connect'
import { loadCoodevConfig } from './coodev-config'

class Coodev implements Coodev.Coodev {
  public readonly renderer: Coodev.Renderer
  private readonly _coodevConfig: Coodev.InternalConfiguration
  private readonly _middlewares: Coodev.CoodevMiddlewares
  private readonly plugins: Coodev.Plugin[] = []
  private viteServer: ViteDevServer | null = null

  constructor(options: Coodev.CoodevOptions) {
    this.renderer = options.renderer

    this._coodevConfig = loadCoodevConfig({
      dev: options.dev,
      ssr: options.ssr,
      plugins: options.plugins,
    })

    this._middlewares = connect()
    this.plugins = this.normalizePlugins(this.coodevConfig.plugins)
  }

  public get middlewares() {
    return this._middlewares
  }

  public get coodevConfig() {
    return this._coodevConfig
  }

  public async prepare() {
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
      const serveStatic = require('serve-static')

      this.middlewares.use(serveStatic(outputDir))
    }

    if (dev || ssr !== false) {
      this.initializeMiddlewares()
    }

    for (const postHook of postHooks) {
      postHook()
    }
  }

  public async start() {
    await this.prepare()

    const server = http.createServer(this.middlewares)

    const { port } = this.coodevConfig.server

    server.listen(port, '0.0.0.0')

    console.log(`> Coodev server is running on http://localhost:${port}`)
  }

  public async build() {
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
    const serverBuildOutput = (await build(serverConfig)) as Coodev.BuildOutput

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

    const clientBuildOutput = (await build(clientConfig)) as Coodev.BuildOutput

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

  public loadSSRModule(module: string) {
    if (!this.viteServer) {
      throw new Error('Vite server is not initialized')
    }
    return this.viteServer.ssrLoadModule(module) as any
  }

  private async callBuildEndHook(
    options: Coodev.BuildEndOptions,
    output: Coodev.BuildOutput,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.buildEnd) {
        await plugin.buildEnd(options, output)
      }
    }
  }

  private async callViteConfigHooks(
    options: Coodev.ViteConfigOptions,
  ): Promise<InlineConfig> {
    const coodevConfig = this.coodevConfig

    let config: InlineConfig = {
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

  private normalizePlugins(
    plugins: Coodev.PluginConfiguration[],
  ): Coodev.Plugin[] {
    const normalizedPlugins: Coodev.Plugin[] = []

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
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
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
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
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
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
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

export function createCoodev(options: Coodev.CoodevOptions) {
  return new Coodev(options)
}
