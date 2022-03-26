import * as createWebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as http from 'http'
import type {
  IRailingOptions,
  IRailingPlugin,
  IRailingRenderer,
  IRailingMiddlewares,
  INextFunction,
} from '@railing/types'
import { HTMLDocument, HTMLScriptElement } from '@railing/document'
import { setRuntimeConfig, getRuntimeConfig } from './runtime-config'
import BaseRailing from './base'
import { GLOBAL_DATA_ELEMENT_ID } from '../constants'

class Railing extends BaseRailing {
  private renderer?: IRailingRenderer

  constructor(options: IRailingOptions) {
    super(options)

    this.applyPlugins(this.railingConfig.plugins)

    this.initializeMiddlewares(this.middlewares)

    this.hooks.middlewares.call(this.middlewares)

    // set initial runtime config
    setRuntimeConfig(this.railingConfig.runtimeConfig)
  }

  public start() {
    console.log('Starting development server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)

    console.log('Railing server listen on http://localhost:3000')
  }

  public setRenderer(renderer: IRailingRenderer) {
    if (!this.renderer) {
      this.renderer = renderer
      this.renderer.initialize(this)
    }
  }

  private applyPlugins(plugins: IRailingPlugin[]) {
    if (plugins.length) {
      for (const plugin of plugins) {
        plugin.apply(this)
      }
    }
  }

  private initializeMiddlewares(middlewares: IRailingMiddlewares) {
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = createWebpackDevMiddleware(compiler, {
      writeToDisk: true,
    })
    middlewares.use(devMiddleware)
    middlewares.use(this.renderToHtml.bind(this))
  }

  private createWebpackCompiler() {
    const webpackConfig = this.hooks.webpackConfig.call([])

    return webpack(webpackConfig)
  }

  private async renderToHtml(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: INextFunction,
  ) {
    if (!this.renderer) {
      throw new Error('Please set a renderer first before railing.start()')
    }

    let documentHtml = await this.renderer.getDocumentHtml({
      req,
      res,
      next,
    })
    documentHtml = this.hooks.documentHtml.call(documentHtml)

    const html = await this.renderer.render(documentHtml, { req, res, next })

    if (html === null) {
      next()
    } else if (!res.writableEnded) {
      const normalized = await this.normalizeHtml(html)
      res.end(normalized)
    }
  }

  private async normalizeHtml(html: string) {
    const document = new HTMLDocument(html)

    // append global data script
    const runtimeConfig = getRuntimeConfig()
    const globalData = this.hooks.globalData.call({ runtimeConfig })
    const stringified = JSON.stringify(globalData)

    const globalDataScript = new HTMLScriptElement(
      { id: GLOBAL_DATA_ELEMENT_ID, type: 'application/json' },
      stringified,
    )
    const head = document.getElementByTagName('head')
    if (!head) {
      throw new Error('`<head/>` not found')
    }
    head.appendChild(globalDataScript)

    return document.toHtml()
  }
}

export function createRailing(options: IRailingOptions) {
  return new Railing(options)
}
