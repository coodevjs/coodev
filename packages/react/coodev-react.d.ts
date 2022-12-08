namespace Coodev {
  type ComponentType<P> = import('react').ComponentType<P>

  export interface ServerEntryModule {
    getDocumentHtml: (ctx: DocumentHtmlRenderContext) => Promise<string>
    renderToString: (ctx: RenderContext) => Promise<string>
    renderToStream: (ctx: RenderContext) => Promise<PipeableStream>
  }

  export interface ReactRenderContext {
    req: Request
    res: Response
    Component: ComponentType<any> | null
  }

  export interface RouteConfig {
    path: string
    component: string
  }

  export type RuntimeConfig = Record<string, any>

  export interface Configuration {
    routes?: RouteConfig[]
    runtimeConfig?: RuntimeConfig
    routing?: 'lazy'
  }

  export interface AppProps<T = any> {
    Component: ComponentType<any> | null
    pageProps: T
  }

  export interface InternalRouteConfig {
    path: string
    component: ComponentType<any>
  }

  export type Location = import('history').Location

  export type BaseRouter = import('history').History

  export type RouteUpdateListener = import('history').Listener

  export interface Router extends BaseRouter {
    onBeforeRouteUpdate: RouteUpdateListener
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

declare module '__COODEV__/react/routes' {
  const routes: Coodev.InternalRouteConfig[]
  export default routes
}

declare module '__COODEV__/react/app' {
  import { Component } from 'react'

  const App: ComponentType<Coodev.AppProps>
  export default App
}

declare module '__COODEV__/react/document' {
  import { Component } from 'react'

  const Document: ComponentType<any>
  export default Document
}

declare module '__COODEV__/react/config' {
  const config: Coodev.Configuration

  export default config
}
