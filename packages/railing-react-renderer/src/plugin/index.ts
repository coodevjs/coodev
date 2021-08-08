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
      config => {
        config
          .entry('app')
          .add(path.resolve(__dirname, '../client.js'))
          .end()
        config
          .resolve.alias
          .set('__RAILING__/react/app', path.join(rootDir, 'app'))
          .end()
      }
    )
  }

}