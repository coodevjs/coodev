import * as React from 'react'

interface CodellContextType {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
}

export const CodellContext = React.createContext<CodellContextType>({} as any)
