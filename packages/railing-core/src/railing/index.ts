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
import {
  EntrypointAssetsPlugin,
  AssetsInfo,
} from '../webpack/plugin/entrypoint-assets'
import { createWebpackChainConfig } from '../webpack'
import { Defer, createDefer } from '../lib/defer'
import { HTMLDocument, HTMLScriptElement } from '../lib/elements'
import { setRuntimeConfig, getRuntimeConfig } from './runtime-config'
import BaseRailing from './base'
import { GLOBAL_DATA_ELEMENT_ID } from '../constants'

class Railing extends BaseRailing {
  private renderer?: IRailingRenderer
  private readonly assetsInfoDefer: Defer<AssetsInfo>

  constructor(options: IRailingOptions) {
    super(options)
    this.assetsInfoDefer = createDefer()

    this.hooks.clientWebpackConfig.tap('railing/entrypoint-asset', config => {
      config
        .plugin('Railing/EntrypointAssetsPlugin')
        .use(EntrypointAssetsPlugin, [
          {
            onAssetsCallback: assets => {
              this.assetsInfoDefer.resolve(assets)
            },
          },
        ])
    })

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
    const clientWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: false,
    })
    this.hooks.clientWebpackConfig.call(clientWebpackConfig)
    if (this.railingConfig.ssr === false) {
      return webpack(clientWebpackConfig.toConfig())
    }
    const serverWebpackConfig = createWebpackChainConfig(this.railingConfig, {
      isDev: true,
      isServer: true,
    })

    // call server webpack config hooks
    this.hooks.serverWebpackConfig.call(serverWebpackConfig)
    return webpack([
      clientWebpackConfig.toConfig(),
      serverWebpackConfig.toConfig(),
    ])
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
    console.log('html response', html)
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

    const { scripts } = await this.assetsInfoDefer.promise

    const body = document.getElementByTagName('body')
    if (!body) {
      throw new Error('`<body/>` not found')
    }
    for (const scriptUrl of scripts) {
      const script = new HTMLScriptElement({
        src: scriptUrl,
        type: 'text/javascript',
      })
      body.appendChild(script)
    }

    return document.toHtml()
  }
}

export function createRailing(options: IRailingOptions) {
  return new Railing(options)
}
