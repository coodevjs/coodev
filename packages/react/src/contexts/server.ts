import * as React from 'react'
import { ReactCoodevConfiguration } from '../types'

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

interface SSRServerContextType {
  url: string
  pathDefinition: string | null
  Component: React.ComponentType<any> | null
  pageProps: object
  manifest: Manifest
  coodevConfig: ReactCoodevConfiguration
}

interface CSRServerContextType {
  coodevConfig: ReactCoodevConfiguration
}

export const ServerContext = React.createContext<
  CSRServerContextType | SSRServerContextType
>({} as any)
