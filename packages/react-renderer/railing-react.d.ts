namespace Railing {
  type IRailingRenderContext = import('@railing/types').IRailingRenderContext

  interface IServerEntryModule {
    getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
    renderToString: (context: IRailingRenderContext) => Promise<string>
    renderToStream: (
      context: IRailingRenderContext,
    ) => Promise<import('react-dom/server').PipeableStream>
  }

  interface IRouteConfig {
    path: string
    component: string
  }

  interface IAppProps {
    Component: React.FC<{}>
    pageProps: object
  }

  interface NormalizedRouteConfig {
    path: string
    component: React.FC
  }

  type IBaseRouter = import('history').History

  type IRouterListener = import('history').Listener

  interface IRouter extends IBaseRouter {
    push: (to: string, state?: any) => void
    replace: (to: string, state?: any) => void
  }
}

declare module '__RAILING__/react/routes' {
  const routes: RailingReact.NormalizedRouteConfig[]
  export default routes
}

declare module '__RAILING__/react/app' {
  const App: React.FC<RailingReact.IRailingReactAppProps>
  export default App
}

declare module '__RAILING__/react/document' {
  const Document: React.FC<{}>
  export default Document
}

declare module '__RAILING__/config' {
  const config: import('@railing/types').IRailingConfig

  export default config
}
