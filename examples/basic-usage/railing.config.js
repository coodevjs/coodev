const {
  RailingReactRendererPlugin,
} = require('@railing/react-renderer/lib/plugin')

class TestPlugin {
  apply(railing) {
    railing.middlewares.use((req, res, next) => {
      console.log('this is TestPlugin middleware', req.url)
      next()
    })

    railing.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
  }
}

const railingConfig = {
  ssr: {
    streamingHtml: true,
  },
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
        {
          path: '/info/:id',
          component: 'src/home',
        },
      ],
    }),
  ],
}

module.exports = railingConfig
