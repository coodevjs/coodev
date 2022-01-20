import { IRailingRenderContext } from '@railing/types'

export interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToHtml: (context: IRailingRenderContext) => Promise<string>
}

export interface IRailingReactRouteConfig {
  path: string
  component: string
}
