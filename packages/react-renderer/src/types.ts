import type { IRailingRenderContext } from '@railing/types'

export interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToString: (context: IRailingRenderContext) => Promise<string>
  renderToStream: (
    context: IRailingRenderContext,
  ) => Promise<import('react-dom/server').PipeableStream>
}

export interface IRouteConfig {
  path: string
  component: string
}

export interface IAppProps {
  Component: React.FC<{}>
  pageProps: object
}

export interface NormalizedRouteConfig {
  path: string
  component: React.FC
}

export type IBaseRouter = import('history').History

export type IRouterListener = import('history').Listener

export interface IRouter extends IBaseRouter {
  push: (to: string, state?: any) => void
  replace: (to: string, state?: any) => void
}
