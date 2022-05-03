import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import {
  railingReact,
  ViteRailingReactPluginOptions,
} from './plugins/railing-react'
import { ssrRefresh } from './plugins/ssr-refresh'
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
    clearScreen: true,
    plugins: [react(), railingReact(opts), ssrRefresh()],
    configFile: false,
    server: {
      middlewareMode: 'ssr',
    },
  })
}
