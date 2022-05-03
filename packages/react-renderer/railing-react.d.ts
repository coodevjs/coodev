/// <reference path="@railing/types" />

namespace Railing {
  export interface ServerEntryModule {
    getDocumentHtml: (context: Railing.RenderContext) => Promise<string>
    renderToString: (context: Railing.RenderContext) => Promise<string>
    renderToStream: (
      context: Railing.RenderContext,
    ) => Promise<import('react-dom/server').PipeableStream>
  }

  export interface RouteConfig {
    path: string
    component: string
  }

  export interface AppProps {
    Component: React.FC<{}>
    pageProps: object
  }

  export interface InternalRouteConfig {
    path: string
    component: React.FC
  }

  export type BaseRouter = import('history').History

  export type RouterListener = import('history').Listener

  export interface Router extends BaseRouter {
    onBeforeRouteUpdate: RouterListener
  }

  export interface GlobalData {
    runtimeConfig: RuntimeConfig
  }
}

declare module '__RAILING__/react/routes' {
  const routes: Railing.InternalRouteConfig[]
  export default routes
}

declare module '__RAILING__/react/app' {
  const App: React.FC<Railing.AppProps>
  export default App
}

declare module '__RAILING__/react/document' {
  const Document: React.FC<{}>
  export default Document
}

declare module '__RAILING__/config' {
  const config: Railing.Configuration

  export default config
}
