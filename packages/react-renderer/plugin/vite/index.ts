import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import {
  railingReact,
  ViteRailingReactPluginOptions,
} from './plugins/railing-react'
import * as path from 'path'
import { railingSourceDir } from '../constants'

export interface ServerOptions extends ViteRailingReactPluginOptions {
  root: string
  ssr: boolean
  dev: boolean
}

export function createViteServer(opts: ServerOptions) {
  return createServer({
    root: opts.root,
    resolve: {},
    build: {
      rollupOptions: {
        input: [
          path.join(railingSourceDir, 'client.tsx'),
          path.join(railingSourceDir, 'server.tsx'),
        ],
      },
    },
    plugins: [react(), railingReact(opts)],
    configFile: false,
    server: {
      middlewareMode: 'ssr',
    },
  })
}
