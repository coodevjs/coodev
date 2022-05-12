```typescript
import { Codell } from '@codell/core'
import {
  ReactRenderer,
  CodellReactRendererPlugin,
} from '@codell/react'
import { ICodellConfigAPI } from '@codell/types'

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
const codell = new Codell({
  renderer,
  dev,
})

codell.hooks.htmlTemplate.tap(
  'updateHTMLTemplate',
  (a: { html: string; req: Request; res: Response }) => {},
)

codell.hooks.htmlRendered.tap(
  'updateHTML',
  (a: { html: string; req: Request; res: Response }) => {},
)

codell.middlewares // return connect middlewares

codell.start({
  port,
}) // create server and start

// use express or others
const app = express()

app.use(codell.middlewares)

app.listen()
/**
 * config
 */
const codellConfig = {
  entry: '',
  outDir: '',
  runtimeConfig: {},
  plugins: [
    new CodellReactRendererPlugin({
      template: 'index.html',
    }),
    (api: ICodellConfigAPI) => {
      api.hooks.webpack.tap('XxPlugin', webpackConfig => {})

      api.hooks.codellConfig.tap('XxPlugin', codellConfig => {})
    },
  ],
}
```
