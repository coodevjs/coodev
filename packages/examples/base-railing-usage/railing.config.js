const {
  RailingReactRendererPlugin,
} = require('@railing/react-renderer/lib/plugin');

class TestPlugin {
  apply(railing) {
    console.log('applied');
    railing.hooks.htmlTemplate.tap('TestPlugin', (html) => {
      console.log('htmlTemplate')
      return html + '<div>Content By TestPlugin</div>';
    });
    railing.hooks.middlewareInitialized.tap('TestPlugin', (middlewares) => {
      console.log('sdasdsads');
      middlewares.use((req, res, next) => {
        console.log('this is TestPlugin middleware', req.url);
        next();
      });
    });
  }
}

const railingConfig = {
  ssr: true,
  entry: '',
  outputDir: '',
  runtimeConfig: {},
  plugins: [new TestPlugin(), new RailingReactRendererPlugin()],
};

module.exports = railingConfig;
