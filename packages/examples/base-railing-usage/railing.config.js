const {
  RailingReactRendererPlugin,
} = require('@railing/react-renderer/lib/plugin');

class TestPlugin {
  apply(railing) {
    railing.hooks.htmlTemplate.tap('TestPlugin', (html) => {
      return html + '<div>Content By TestPlugin</div>';
    });
    railing.hooks.initializeMiddlewares.tap('TestPlugin', (middlewares) => {
      middlewares.use((req, res, next) => {
        console.log('this is TestPlugin middleware', req.url);
        next();
      });
    });
  }
}

const railingConfig = {
  ssr: false,
  runtimeConfig: {},
  plugins: [new TestPlugin(), new RailingReactRendererPlugin()],
};

module.exports = railingConfig;
