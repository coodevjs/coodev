const coodevConfig = {
  ssr: {
    streamingHtml: true,
  },
  routing: 'lazy',
  runtimeConfig: {
    name: 'Test',
  },
  plugins: [
    {
      documentHtml(html) {
        return html + '<div>Content By TestPlugin</div>'
      },
    },
  ],
}

module.exports = coodevConfig
