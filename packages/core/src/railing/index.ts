import * as http from 'http'
import BaseRailing from './base'

class Railing extends BaseRailing {
  private readonly prePlugins: Railing.Plugin[] = []
  private readonly postPlugins: Railing.Plugin[] = []
  private renderer?: Railing.RendererPlugin

  constructor(options: Railing.RailingOptions) {
    super(options)

    this.classifyPlugins(this.railingConfig.plugins)
    this.applyPlugins()
  }

  public start() {
    console.log('Starting development server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Railing server is running on http://localhost:3000')
  }

  private classifyPlugins(
    plugins: (Railing.Plugin | Railing.RendererPlugin)[],
  ) {
    for (const plugin of plugins) {
      if ('__IS_RENDERER_PLUGIN__' in plugin && plugin.__IS_RENDERER_PLUGIN__) {
        if (this.renderer) {
          throw new Error('Only one renderer plugin can be set')
        }
        this.renderer = plugin
      }

      if (plugin.enforce === 'pre') {
        this.prePlugins.push(plugin)
      } else {
        this.postPlugins.push(plugin)
      }
    }
  }

  private async applyPlugins() {
    for (const plugin of this.prePlugins) {
      await plugin.apply(this)
    }

    this.initializeMiddlewares(this.middlewares)

    for (const plugin of this.postPlugins) {
      await plugin.apply(this)
    }
  }

  private initializeMiddlewares(middlewares: Railing.RailingMiddlewares) {
    const ssr = this.railingConfig.ssr

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
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Railing.NextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before railing.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const stream = await this.renderer.renderToStream({
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
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Railing.NextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before railing.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const html = await this.renderer.renderToString({
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
      res.end(html)
    }
  }

  private async getDocumentHtml(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Railing.NextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please provide a renderer first before railing.start()')
    }

    let hasCalledNext = false

    const wrappedNext = (...args: any[]) => {
      hasCalledNext = true
      next(...args)
    }

    const documentHtml = await this.renderer.getDocumentHtml({
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

export function createRailing(options: Railing.RailingOptions) {
  return new Railing(options)
}
