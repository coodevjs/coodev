import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import {
  railingReact,
  IViteRailingReactPluginOptions,
} from './plugins/railing-react'
import * as path from 'path'
import { railingSourceDir } from '../constants'

export interface ServerOptions extends IViteRailingReactPluginOptions {
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
