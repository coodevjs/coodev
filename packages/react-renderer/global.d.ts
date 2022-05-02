type IRailingRenderContext = import('@railing/types').IRailingRenderContext

interface IServerEntryModule {
  getDocumentHtml: (context: IRailingRenderContext) => Promise<string>
  renderToHtml: (context: IRailingRenderContext) => Promise<string>
  renderToStream: (
    context: IRailingRenderContext,
  ) => Promise<import('react-dom/server').PipeableStream>
}

interface IRailingReactRouteConfig {
  path: string
  component: string
}

interface IRailingReactAppProps {
  Component: React.FC<{}>
  pageProps: object
}

interface NormalizedRouteConfig {
  path: string
  component: React.FC
}

declare module '__RAILING__/react/routes' {
  const routes: NormalizedRouteConfig[]
  export default routes
}

declare module '__RAILING__/react/app' {
  const App: React.FC<IRailingReactAppProps>
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
