import * as React from 'react'
import { match, pathToRegexp } from 'path-to-regexp'
import { parse as parseUrl, Url } from 'url'
import {
  createBrowserHistory,
  createMemoryHistory,
  Blocker,
  Location
} from 'history'

const history = typeof window !== 'undefined'
  ? createBrowserHistory()
  : createMemoryHistory()

const RouterContext = React.createContext({} as {
  location: Location,
  params: object
})

function matchParams(path: string, pathname: string) {
  const matched = match(path)(pathname)
  return matched ? matched.params : {}
}

export const router: Railing.Router = {
  get action() {
    return history.action
  },
  get location() {
    return history.location
  },
  go(delta: number) {
    return history.go(delta)
  },
  forward() {
    return history.forward()
  },
  back() {
    return history.back()
  },
  createHref(to: string) {
    return history.createHref(to)
  },
  push(to: string, state?: any) {
    // onBeforeRouteUpdate(to, state)
    history.push(to, state)
  },
  replace(to: string, state?: any) {
    // onBeforeRouteUpdate(to, state)
    history.push(to, state)
  },
  listen(listener: Railing.RouterListener) {
    return history.listen(listener)
  },
  block(blocker: Blocker) {
    return history.block(blocker)
  },
  onBeforeRouteUpdate() { }
}


export function useLocation() {
  return React.useContext(RouterContext).location
}

export function useParams<T>(): T {
  return React.useContext(RouterContext).params as any as T
}

export function findMatchedRoute(url: string, routes: Railing.InternalRouteConfig[] = []) {
  // 通配符
  const wildcard = '(.*)'
  const { pathname } = parseUrl(url)
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
      return pathToRegexp(route.path).test(pathname + '')
    })

  return matched
}

export function Router(props: any) {
  const component = React.useRef<React.ComponentType<any> | null>(props.component)
  const pageProps = React.useRef(props.pageProps)

  const currentRoute = React.useRef<{ path: string }>()
  const [location, setLocation] = React.useState<Location>(() => {
    const parsedUrl: Url = parseUrl(props.url)
    return {
      key: '',
      pathname: parsedUrl.pathname || '/',
      search: parsedUrl.search || '',
      hash: parsedUrl.hash || '',
      state: null,
    }
  })
  const [params, setParams] = React.useState<object>(() => {
    const matchedRoute = findMatchedRoute(props.url, props.routes)
    return matchParams(matchedRoute ? matchedRoute.path : '', location.pathname)
  })

  React.useEffect(
    () => {
      const unlisten = history.listen(async (update) => {
        if (update.location.pathname === location.pathname) {
          // H.locationsAreEqual(location, newLocation)
          // 忽略 search 变化
          return
        }
        const matched = findMatchedRoute(
          update.location.pathname,
          props.routes
        )
        // if (matched) {
        //   const initialProps = await callGetInitialProps(
        //     props.App,
        //     matched.component,
        //     newLocation.pathname,
        //   )
        //   pageProps.current = initialProps
        //   component.current = matched.component
        // } else {
        //   component.current = null
        // }
        // unstable_batchedUpdates(() => {
        //   setLocation(newLocation)
        //   setParams(
        //     matched ? matchParams(matched.path, newLocation.pathname) : {}
        //   )
        // })
      })
      return unlisten
    },
    [location.pathname]
  )

  const store = React.useMemo(
    () => ({ location, params }),
    [location]
  )

  return (
    <RouterContext.Provider value={store}>
      {/* <props.App
        pageProps={pageProps.current}
        Component={component.current}
      /> */}
    </RouterContext.Provider>
  )
}