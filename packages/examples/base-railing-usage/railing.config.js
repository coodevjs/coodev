const {
  RailingReactRendererPlugin,
} = require('@railing/react-renderer/lib/plugin');

class TestPlugin {
  apply(railing) {
    railing.hooks.htmlTemplate.tap('TestPlugin', (html) => {
      return html + '<div>Content By TestPlugin</div>';
    });
    railing.hooks.middlewaresInitialized.tap('TestPlugin', (middlewares) => {
      middlewares.use((req, res, next) => {
        console.log('this is TestPlugin middleware', req.url);
        next();
      });
    });
  }
}

const railingConfig = {
  ssr: true,
  runtimeConfig: {},
  plugins: [
    new TestPlugin(),
    new RailingReactRendererPlugin({
      template: './src/index.html',
      routes: [
        {
          path: '/',
          component: './src/home'
        },
        {
          path: '/other',
          component: './src/other'
        }
      ]
    }),
  ],
};

module.exports = railingConfig;
