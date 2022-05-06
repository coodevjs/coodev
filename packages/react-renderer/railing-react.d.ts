/// <reference path="@railing/types" />

namespace Railing {
  export interface ServerEntryModule {
    getDocumentHtml: (ctx: RenderContext) => Promise<string>
    renderToString: (ctx: RenderContext) => Promise<string>
    renderToStream: (ctx: RenderContext) => Promise<PipeableStream>
  }

  export interface ReactRenderContext {
    req: import('http').IncomingMessage
    res: import('http').ServerResponse
    Component: import('react').ComponentType<any> | null
  }

  export interface RouteConfig {
    path: string
    component: string
  }

  export interface AppProps {
    Component: import('react').ComponentType<any> | null
    pageProps: object
  }

  export interface InternalRouteConfig {
    path: string
    component: import('react').ComponentType<any>
  }

  export type Location = import('history').Location

  export type BaseRouter = import('history').History

  export type RouterListener = import('history').Listener

  export interface Router extends BaseRouter {
    onBeforeRouteUpdate: RouterListener
  }

  export interface GlobalData {
    pageProps: object
  }

  export interface LinkProps
    extends Omit<HTMLAttributes<HTMLAnchorElement>, 'href'> {
    to: string
  }
}

namespace React {
  interface ComponentClass<P = {}> {
    getInitialProps?: (...args: any[]) => any
  }
  interface FunctionComponent<P = {}> {
    getInitialProps?: (...args: any[]) => any
  }
}

declare module '__RAILING__/react/routes' {
  const routes: Railing.InternalRouteConfig[]
  export default routes
}

declare module '__RAILING__/react/app' {
  const App: import('react').ComponentType<Railing.AppProps>
  export default App
}

declare module '__RAILING__/react/document' {
  const Document: import('react').ComponentType<any>
  export default Document
}

declare module '__RAILING__/config' {
  const config: Railing.Configuration

  export default config
}
