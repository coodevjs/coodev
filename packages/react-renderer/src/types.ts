import type { FunctionComponent } from 'react'
import type { PipeableStream } from 'react-dom/server'
import type { IRailingRenderContext } from '@railing/types'

export interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToHtml: (context: IRailingRenderContext) => Promise<string>
  renderToStream: (context: IRailingRenderContext) => Promise<PipeableStream>
}

export interface IRailingReactRouteConfig {
  path: string
  component: string
}

export interface IRailingReactAppProps {
  Component: FunctionComponent
  pageProps: object
}
