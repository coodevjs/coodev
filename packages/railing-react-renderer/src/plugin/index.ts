import { IRailingPlugin, IRailing } from '@railing/types'

export class RailingReactRendererPlugin implements IRailingPlugin {
  public apply(railing: IRailing) {
    const htmlTemplate = `
          <html>
            <body>Content By RailingReactRendererPlugin</body>
          </html>
        `

    const finalHtmlTemplate = railing.hooks.htmlTemplate.call(htmlTemplate)

    railing.hooks.initializeMiddlewares.tap('RailingReactRendererPlugin', middlewares => {
      middlewares.use((req, res, next) => {
        if (req.url === '/') {
          res.end(finalHtmlTemplate)
        } else {
          next()
        }
      })
    })
  }

}