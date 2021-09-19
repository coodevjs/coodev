import type { IncomingMessage, ServerResponse } from 'http'

export interface IRenderToHTMLOptions {
  req: IncomingMessage
  res: ServerResponse
  // need this?
  next?: any
}

export type IHTMLRenderer = (options: IRenderToHTMLOptions) => Promise<string>

export interface IServerEntry {
  renderToHTML: IHTMLRenderer;
}

export interface IRailingReactRouteConfig {
  path: string
  component: string
}
