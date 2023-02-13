type ComponentType<P> = import('react').ComponentType<P>
type ReactCoodevConfiguration = import('./src/types').ReactCoodevConfiguration
type InternalRouteConfig = import('./src/types').InternalRouteConfig
type AppProps = import('./src/types').AppProps

declare module '__COODEV__/react/routes' {
  const routes: InternalRouteConfig[]
  export default routes
}

declare module '__COODEV__/react/app' {
  import { Component } from 'react'

  const App: ComponentType<AppProps>
  export default App
}

declare module '__COODEV__/react/document' {
  import { Component } from 'react'

  const Document: ComponentType<any>
  export default Document
}

declare module '__COODEV__/react/config' {
  const config: ReactCoodevConfiguration

  export default config
}
