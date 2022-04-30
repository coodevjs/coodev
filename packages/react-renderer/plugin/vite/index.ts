import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import {
  railingReactPlugin,
  IViteRailingReactPluginOptions,
} from './plugins/railing-react'
import * as path from 'path'
import { sourceDir } from '../constants'

export interface ServerOptions extends IViteRailingReactPluginOptions {}

export function createViteServer(opts: ServerOptions) {
  console.log(path.join(process.cwd(), '..', '..'))
  console.log(
    path.join(sourceDir, 'client.tsx'),
    path.join(sourceDir, 'server.tsx'),
  )

  return createServer({
    // root: path.join(process.cwd(), '..', '..'),
    build: {
      rollupOptions: {
        input: [
          path.join(sourceDir, 'client.tsx'),
          path.join(sourceDir, 'server.tsx'),
        ],
      },
    },
    resolve: {
      alias: {
        '__RAILING__/react/app': path.resolve(sourceDir, 'app'),
        '__RAILING__/react/document': path.resolve(sourceDir, 'document'),
      },
    },
    plugins: [
      react({
        // include: sourceDir,
      }),
      railingReactPlugin(opts),
    ],
    configFile: false,
    server: {
      middlewareMode: 'ssr',
    },
  })
}
