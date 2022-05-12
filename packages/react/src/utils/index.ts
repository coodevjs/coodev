import { parse as parseUrl } from 'url'
import { pathToRegexp } from 'path-to-regexp'

export function findMatchedRoute(
  path: string,
  routes: Codell.InternalRouteConfig[] = [],
) {
  const pathname = parseUrl(path).pathname ?? '/'
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