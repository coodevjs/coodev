const {
  CodellReactRendererPlugin,
} = require('@codell/react/lib/plugin')

class TestPlugin {
  apply(codell) {
    codell.middlewares.use((req, res, next) => {
      console.log('this is TestPlugin middleware', req.url)
      next()
    })

    codell.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
  }
}

const codellConfig = {
  ssr: {
    streamingHtml: true,
  },
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [new TestPlugin(), new CodellReactRendererPlugin()],
}

module.exports = codellConfig
