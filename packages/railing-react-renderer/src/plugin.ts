import { IRailingPlugin, IRailing, IWebpackChainConfig } from '@railing/types'
import * as path from 'path'
import * as fs from 'fs'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import { EMITTED_HTML_FILENAME } from './constants'
import { IRailingReactRouteConfig } from './types'
import RailingReactRenderer from './renderer'

export interface IRailingReactRendererPluginOptions {
  template?: string
  routes?: IRailingReactRouteConfig[]
}

export class RailingReactRendererPlugin implements IRailingPlugin {

  private readonly options: IRailingReactRendererPluginOptions

  constructor(options: IRailingReactRendererPluginOptions) {
    // TODO validate options
    this.options = options
  }

  public apply(railing: IRailing) {
    const { rootDir } = railing.railingConfig

    railing.setRenderer(new RailingReactRenderer())

    this.createRouteConfigFile(rootDir, this.options.routes || [])

    railing.hooks.clientWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('main')
          .add(path.resolve(__dirname, './client.js'))
          .end()

        config
          .plugin('html-webpack-plugin')
          .use(HtmlWebpackPlugin, [{
            template: this.options.template,
            filename: EMITTED_HTML_FILENAME
          }])

        this.addWebpackResolveAlias(config, rootDir)
      }
    )

    railing.hooks.serverWebpackConfig.tap(
      'RailingReactRendererPlugin',
      config => {
        config
          .entry('main')
          .add(path.resolve(__dirname, './server.js'))
          .end()
        this.addWebpackResolveAlias(config, rootDir)
      }
    )
  }

  private addWebpackResolveAlias(config: IWebpackChainConfig, rootDir: string) {
    config
      .resolve.alias
      .set('__RAILING__/react/app', path.join(rootDir, 'src', 'app'))
      .end()

    config
      .resolve.alias
      .set('__RAILING__/react/routes', path.join(rootDir, '.railing', 'routes'))
      .end()
  }

  private createRouteConfigFile(rootDir: string, routes: IRailingReactRouteConfig[]) {
    const baseDir = path.join(rootDir, '.railing')
    const routeConfigPath = path.join(baseDir, 'routes.js')

    const content = routes.map(route => {
      const fullPath = path.resolve(rootDir, route.component)
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/, '/')
      return `{path:'${route.path}', component: require('../${relativePath}')}`
    })

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    if (fs.existsSync(routeConfigPath)) {
      fs.unlinkSync(routeConfigPath)
    }

    fs.writeFileSync(routeConfigPath, `export default [${content.join(',')}]`)
  }

}