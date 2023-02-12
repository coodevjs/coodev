import type { ComponentType } from 'react'
import type {
  Location,
  Listener as RouteUpdateListener,
  History as BaseRouter,
} from 'history'
import type { Request, Response, Configuration } from '@coodev/core'

export { Location, RouteUpdateListener }

export interface ReactRenderContext {
  req: Request
  res: Response
  Component: ComponentType<any> | null
}

export interface RouteConfig {
  path: string
  component: string
}

export type RuntimeConfig = Record<string, any>

export interface ReactCoodevConfiguration extends Required<Configuration> {
  routes?: RouteConfig[]
  runtimeConfig?: RuntimeConfig
  routing?: 'lazy'
}

export interface AppProps<T = any> {
  Component: ComponentType<any> | null
  pageProps: T
}

export interface InternalRouteConfig {
  path: string
  component: ComponentType<any>
}

export interface Router extends BaseRouter {
  onBeforeRouteUpdate: RouteUpdateListener
}

export interface GlobalData {
  pageProps: object
}
