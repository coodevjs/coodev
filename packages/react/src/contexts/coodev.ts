import * as React from 'react'

interface CoodevContextType {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
}

export const CoodevContext = React.createContext<CoodevContextType>({} as any)
