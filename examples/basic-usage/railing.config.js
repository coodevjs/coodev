const {
  RailingReactRendererPlugin,
} = require('@railing/react-renderer/lib/plugin')

class TestPlugin {
  apply(railing) {
    railing.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
    railing.hooks.middlewares.tap('TestPlugin', middlewares => {
      middlewares.use((req, res, next) => {
        console.log('this is TestPlugin middleware', req.url)
        next()
      })
    })
  }
}

const railingConfig = {
  ssr: true,
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [
    new TestPlugin(),
    new RailingReactRendererPlugin({
      routes: [
        {
          path: '/',
          component: 'src/home',
        },
        {
          path: '/other',
          component: 'src/other',
        },
      ],
    }),
  ],
}

module.exports = railingConfig
