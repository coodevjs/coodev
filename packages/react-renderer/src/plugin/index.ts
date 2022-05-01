import { IRailingPlugin, IRailing, IRailingConfig } from '@railing/types'
import { createViteServer } from './vite'
import RailingReactRenderer from './renderer'

export interface IRailingReactRouteConfig {
  path: string
  component: string
}

export interface IRailingReactRendererPluginOptions {
  routes?: IRailingReactRouteConfig[]
}

export class RailingReactRendererPlugin implements IRailingPlugin {
  private readonly options: IRailingReactRendererPluginOptions
  private readonly renderer: RailingReactRenderer
  private railingConfig: IRailingConfig

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
    this.renderer = new RailingReactRenderer()
    this.railingConfig = {}
  }

  public apply(railing: IRailing) {
    this.railingConfig = railing.railingConfig

    railing.setRenderer(this.renderer)

    railing.hooks.middlewares.tapPromise(
      'RailingReactRendererPlugin',
      async middlewares => {
        const { rootDir, ssr, dev } = railing.railingConfig
        const vite = await createViteServer({
          root: rootDir,
          ssr,
          dev,
          railingConfig: {
            ssr,
            dev,
          },
          routes: this.options.routes ?? [],
        })

        middlewares.use(vite.middlewares)

        this.renderer.setViteDevServer(vite)
      },
    )
  }
}
