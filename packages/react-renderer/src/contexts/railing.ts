import * as React from 'react'

interface RailingContextType {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
}

export const RailingContext = React.createContext<RailingContextType>({} as any)
