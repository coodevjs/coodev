import * as React from 'react'

interface ServerContextType {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
}

export const ServerContext = React.createContext<ServerContextType>({} as any)
