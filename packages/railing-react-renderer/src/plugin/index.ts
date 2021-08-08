import { IRailingPlugin, IRailing } from '@railing/types'
import * as path from 'path'

export class RailingReactRendererPlugin implements IRailingPlugin {
  public apply(railing: IRailing) {
    const rootDir = process.cwd()
    const htmlTemplate = `
          <html>
            <body>
              <h1>Content By RailingReactRendererPlugin</h1>
              <div id="__RAILING_APP__"></div>
            </body>
            <script src="http://localhost:3000/app.js"></script>
          </html>
        `

    const finalHtmlTemplate = railing.hooks.htmlTemplate.call(htmlTemplate)

    railing.hooks.initializeMiddlewares.tap(
      'RailingReactRendererPlugin',
      middlewares => {
        middlewares.use((req, res, next) => {
          if (req.url === '/') {
            res.end(finalHtmlTemplate)
          } else {
            next()
          }
        })
      }
    )

    railing.hooks.clientWebpackConfig.tap(
      'RailingReactRendererPlugin',
      webpackConfig => {
        if (!webpackConfig.resolve) {
          webpackConfig.resolve = {}
        }
        if (!webpackConfig.resolve.alias) {
          webpackConfig.resolve.alias = {}
        }
        // @ts-ignore
        webpackConfig.resolve.alias['__RAILING__/react/app'] = path.join(rootDir, 'app.tsx')
        webpackConfig.entry = {
          app: path.resolve(__dirname, '../client.js')
        }

        return webpackConfig
      }
    )
  }

}