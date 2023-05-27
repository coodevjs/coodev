import type { ComponentType } from 'react'
import type {
  Location,
  Listener as RouteUpdateListener,
  History as BaseRouter,
} from 'history'
import type { Request, Response, Configuration } from '@coodev/core'

export { Location, RouteUpdateListener }

export interface ReactRenderContext {
  req?: Request
  res?: Response
  Component: ComponentType<any> | null
  url: string
  params: object
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

export type SerializedConfiguration = Pick<
  ReactCoodevConfiguration,
  'ssr' | 'dev' | 'routing' | 'publicPath' | 'runtimeConfig'
>

export interface AppProps<T = any> {
  Component: ComponentType<any> | null
  pageProps: T
  params: object
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
  publicPath: string
  runtimeConfig: RuntimeConfig
}

declare global {
  namespace React {
    interface ComponentClass<P = {}> {
      getInitialProps?: (...args: any[]) => any
    }
    interface FunctionComponent<P = {}> {
      getInitialProps?: (...args: any[]) => any
    }
  }
}
