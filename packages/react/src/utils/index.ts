import { pathToRegexp } from 'path-to-regexp'
import { match } from 'path-to-regexp'
import type { InternalRouteConfig } from '../types'

export function matchParams(path: string, pathname: string) {
  const matched = match(path)(pathname)
  return matched ? matched.params : {}
}

export function findMatchedRoute(
  path: string,
  routes: InternalRouteConfig[] = [],
) {
  const parsedUrl = new URL(path, 'http://localhost')
  const pathname = parsedUrl.pathname ?? '/'
  // 通配符
  const wildcard = '(.*)'
  const matched = routes
    .map(route => {
      if (route.path === '*') {
        return {
          ...route,
          path: wildcard,
        }
      }
      return route
    })
    .find(route => {
      return pathToRegexp(route.path).test(pathname)
    })

  return matched
}
