const { CoodevReactRendererPlugin } = require('@coodev/react/lib/plugin')

class TestPlugin {
  apply(coodev) {
    coodev.middlewares.use((req, res, next) => {
      console.log('this is TestPlugin middleware', req.url)
      next()
    })

    coodev.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
  }
}

const coodevConfig = {
  ssr: {
    streamingHtml: true,
  },
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [new TestPlugin(), new CoodevReactRendererPlugin()],
}

module.exports = coodevConfig
