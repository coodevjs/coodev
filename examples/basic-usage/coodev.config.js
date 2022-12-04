class TestPlugin {
  apply(coodev) {
    coodev.middlewares.use((req, res, next) => {
      // console.log('this is TestPlugin middleware', req.url)
      next()
    })

    coodev.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
  }
}

const coodevConfig = {
  ssr: {
    streamingHtml: false,
  },
  // routing: 'lazy',
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [new TestPlugin()],
}

module.exports = coodevConfig
