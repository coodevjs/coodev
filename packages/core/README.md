```typescript
import { Coodev } from '@coodev/core'
import { ReactRenderer, CoodevReactRendererPlugin } from '@coodev/react'
import { ICoodevConfigAPI } from '@coodev/types'

/**
 * only client side render
 */
const renderer = new ReactRenderer({
  ssr: false,
  App: null,
  routes: [],
  config: {},
})

renderer.render()

// only server side renderer
const coodev = new Coodev({
  renderer,
  dev,
})

coodev.hooks.htmlTemplate.tap(
  'updateHTMLTemplate',
  (a: { html: string; req: Request; res: Response }) => {},
)

coodev.hooks.htmlRendered.tap(
  'updateHTML',
  (a: { html: string; req: Request; res: Response }) => {},
)

coodev.middlewares // return connect middlewares

coodev.start({
  port,
}) // create server and start

// use express or others
const app = express()

app.use(coodev.middlewares)

app.listen()
/**
 * config
 */
const coodevConfig = {
  entry: '',
  outDir: '',
  runtimeConfig: {},
  plugins: [
    new CoodevReactRendererPlugin({
      template: 'index.html',
    }),
    (api: ICoodevConfigAPI) => {
      api.hooks.webpack.tap('XxPlugin', webpackConfig => {})

      api.hooks.coodevConfig.tap('XxPlugin', coodevConfig => {})
    },
  ],
}
```
