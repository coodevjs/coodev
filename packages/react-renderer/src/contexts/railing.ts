import * as React from 'react'

interface RailingContextType {
  url: string
  path: string
  Component: React.ComponentType<any>
  pageProps: object
}

export const RailingContext = React.createContext<RailingContextType>({} as any)
