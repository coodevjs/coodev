import type * as React from 'react'
import { IRailingRenderContext } from 'packages/types'

export interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToHtml: (context: IRailingRenderContext) => Promise<string>
}

export interface IRailingReactRouteConfig {
  path: string
  component: string
}

export interface IRailingReactAppProps {
  Component: React.FC
  pageProps: object
}
