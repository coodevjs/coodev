import * as http from 'http'
import {
  ViteDevServer,
  createServer as createViteServer,
  mergeConfig,
  InlineConfig,
  build,
} from 'vite'
import BaseCoodev from './base'

class Coodev extends BaseCoodev {
  private viteServer: ViteDevServer | null = null

  constructor(options: Coodev.CoodevOptions) {
    super(options)

    this.applyPlugins(this.coodevConfig.plugins)
  }

  public async prepare() {
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
  }

  public async start() {
    await this.prepare()

    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Coodev server is running on http://localhost:3000')
  }

  public async build() {
    const coodevConfig = this.coodevConfig

    const ssr = coodevConfig.ssr !== false
    const serverConfig = await this.initializeViteConfig({
      ssr,
      dev: false,
      isServer: true,
      isClient: false,
    })
    // Build server side
    const serverBuildOutput = (await build(serverConfig)) as Coodev.BuildOutput

    await this.hooks.buildCompleted.call(serverBuildOutput, {
      ssr,
      isServer: true,
      isClient: false,
    })

    // Build client side
    const clientConfig = await this.initializeViteConfig({
      ssr,
      dev: false,
      isServer: false,
      isClient: true,
    })

    const clientBuildOutput = (await build(clientConfig)) as Coodev.BuildOutput
    await this.hooks.buildCompleted.call(clientBuildOutput, {
      ssr,
      isServer: false,
      isClient: true,
    })
  }

  public loadSSRModule(module: string) {
    if (!this.viteServer) {
      throw new Error('Vite server is not initialized')
    }
    return this.viteServer.ssrLoadModule(module) as any
  }

  private async applyPlugins(plugins: Coodev.Plugin[]) {
    for (const plugin of plugins) {
      await plugin.apply(this)
    }
  }

  private async initializeViteConfig(
    options: Coodev.ViteConfigWaterfallHookOptions,
  ): Promise<InlineConfig> {
    const coodevConfig = this.coodevConfig
    const viteConfig = await this.hooks.viteConfig.call(
      {
        root: coodevConfig.root,
        clearScreen: true,
        build: {
          outDir: coodevConfig.outputDir,
        },
      },
      options,
    )

    const merged = mergeConfig(viteConfig, {
      configFile: false,
      server: {
        middlewareMode: 'ssr',
      },
    })

    return merged
  }

  private async initializeViteServer() {
    const coodevConfig = this.coodevConfig
    const viteConfig = await this.initializeViteConfig({
      ssr: coodevConfig.ssr !== false,
      dev: coodevConfig.dev,
      isClient: true,
      isServer: true,
    })

    this.viteServer = await createViteServer(viteConfig)

    this.middlewares.use(this.viteServer.middlewares)

    this.initializeMiddlewares()
  }

  private initializeMiddlewares() {
    const ssr = this.coodevConfig.ssr

    if (ssr === false) {
      this.middlewares.use(this.getDocumentHtml.bind(this))
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
      const result = await this.hooks.htmlRendered.call(html)
      res.end(result)
    }
  }

  private async getDocumentHtml(
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
    const result = await this.hooks.documentHtml.call(documentHtml)

    res.end(result)
  }
}

export function createCoodev(options: Coodev.CoodevOptions) {
  return new Coodev(options)
}
