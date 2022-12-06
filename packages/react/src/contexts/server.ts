import * as React from 'react'

export type Manifest = Record<string, ManifestChunk>

export interface ManifestChunk {
  src?: string
  file: string
  css?: string[]
  assets?: string[]
  isEntry?: boolean
  isDynamicEntry?: boolean
  imports?: string[]
  dynamicImports?: string[]
}

interface ServerContextType {
  url: string
  path: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
  manifest: Manifest
}

export const ServerContext = React.createContext<ServerContextType>({} as any)
