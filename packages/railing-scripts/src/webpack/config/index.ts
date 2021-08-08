import * as path from 'path'
import { IInternalRailingConfig, IWebpackChainConfig } from '@railing/types'
import * as nodeExternals from 'webpack-node-externals'
import * as Config from 'webpack-chain'
import type { ICreateWebpackConfigOptions } from '../../types'

function createBabelLoaderOptions(isServer: boolean) {
  const presets = [
    require.resolve('@babel/preset-react'),
    [
      require.resolve('@babel/preset-typescript'),
      {
        isTSX: true,
        allExtensions: true,
        allowNamespaces: false,
      }
    ],
  ]
  if (!isServer) {
    presets.push(require.resolve('@babel/preset-env'))
  }
  return {
    plugins: isServer
      ? [require.resolve('@babel/plugin-proposal-class-properties')]
      : [
        require.resolve('@babel/plugin-proposal-class-properties'),
        [
          require.resolve('@babel/plugin-transform-runtime'),
          {
            helpers: true,
            regenerator: true,
            useESModules: false,
          },
        ],
      ],
    presets,
  }
}

export function createWebpackChainConfig(
  railingConfig: IInternalRailingConfig,
  options: ICreateWebpackConfigOptions
): IWebpackChainConfig {
  const config = new Config()

  const resolveAppPath = (...paths: string[]) => path.resolve(railingConfig.rootDir, ...paths)

  config
    .bail(options.isDev)
    .mode(options.isDev ? 'development' : 'production')
    .devtool((options.isDev && !options.isServer) ? 'source-map' : false)
    .stats(options.isServer ? 'none' : 'normal')
    .target(options.isServer ? 'node' : 'web')

  config.output
    .path(resolveAppPath(railingConfig.outputDir, options.isServer ? 'server' : 'client'))
    .publicPath('./')
    .filename((!options.isServer && !options.isDev) ? 'js/[name].[chunkhash:5].js' : '[name].js')
    .chunkFilename((!options.isServer && !options.isDev) ? 'js/[name].[chunkhash:5].chunk.js' : '[name].chunk.js')
    .libraryTarget(options.isServer ? 'commonjs' : 'umd')
    .end()

  config.resolve.extensions
    .add('.js')
    .add('.jsx')
    .add('.ts')
    .add('.tsx')
    .end()

  config.module
    .rule('compile')
    .test(/\.(t|j)sx?$/)
    .exclude.add(/node_modules/).end()
    .include.add(railingConfig.rootDir).end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(createBabelLoaderOptions(options.isServer))

  config.externals(options.isServer ? [nodeExternals()] : undefined)

  return config
}