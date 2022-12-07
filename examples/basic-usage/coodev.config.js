class TestPlugin {
  apply(coodev) {
    coodev.hooks.documentHtml.tap('TestPlugin', html => {
      return html + '<div>Content By TestPlugin</div>'
    })
  }
}

const coodevConfig = {
  ssr: {
    streamingHtml: true,
  },
  routing: 'lazy',
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [new TestPlugin()],
}

module.exports = coodevConfig
