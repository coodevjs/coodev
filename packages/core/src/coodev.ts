import * as http from 'http'
import {
  ViteDevServer,
  createServer as createViteServer,
  mergeConfig,
} from 'vite'
import BaseCoodev from './base'

class Coodev extends BaseCoodev {
  private readonly renderer: Coodev.Renderer
  private viteServer: ViteDevServer | null = null

  constructor(options: Coodev.CoodevOptions) {
    super(options)

    this.renderer = options.renderer

    this.applyPlugins(this.coodevConfig.plugins)

    if (options.dev) {
      this.initializeViteServer()
    }
  }

  public start() {
    console.log('Starting development server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Coodev server is running on http://localhost:3000')
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

  private async initializeViteServer() {
    const viteConfig = this.hooks.viteConfig.call({
      root: this.coodevConfig.root,
      clearScreen: true,
    })

    this.viteServer = await createViteServer(
      mergeConfig(viteConfig, {
        configFile: false,
        server: {
          middlewareMode: 'ssr',
        },
      }),
    )

    this.middlewares.use(this.viteServer.middlewares)

    this.initializeMiddlewares(this.middlewares)
  }

  private initializeMiddlewares(middlewares: Coodev.CoodevMiddlewares) {
    const ssr = this.coodevConfig.ssr

    if (ssr === false) {
      middlewares.use(this.getDocumentHtml.bind(this))
      return
    }

    if (typeof ssr === 'object' && ssr.streamingHtml) {
      middlewares.use(this.renderToStream.bind(this))
      return
    }

    middlewares.use(this.renderToString.bind(this))
  }

  private async renderToStream(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before coodev.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
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
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before coodev.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
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
      console.warn(
        'Renderer returned null or undefined, skipping response, You can directly call next() in your renderer',
      )
      next()
    } else {
      res.end(this.hooks.htmlRendered.call(html))
    }
  }

  private async getDocumentHtml(
    req: Coodev.Request,
    res: Coodev.Response,
    next: Coodev.NextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before coodev.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const documentHtml = await this.renderer.getDocumentHtml(this, {
      req,
      res,
      next: wrappedNext,
    })

    if (hasCalledNext) {
      return
    }

    res.end(this.hooks.documentHtml.call(documentHtml))
  }
}

export function createCoodev(options: Coodev.CoodevOptions) {
  return new Coodev(options)
}
