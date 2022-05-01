import type * as React from 'react'
import { IRailingRenderContext } from '@railing/types'

export interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToHtml: (context: IRailingRenderContext) => Promise<string>
}

export interface IRailingReactRouteConfig {
  path: string
  component: string
}

export interface __NormalizedRouteConfig__
  extends Omit<IRailingReactRouteConfig, 'component'> {
  component: React.FC
}

export interface IRailingReactAppProps {
  Component: React.FC
  pageProps: object
}
