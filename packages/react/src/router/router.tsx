import * as React from 'react'
import { match } from 'path-to-regexp'
import {
  createBrowserHistory,
  createMemoryHistory,
  Blocker,
} from 'history'
import { RouterContext } from '../contexts/router'

export const history = typeof window !== 'undefined'
  ? createBrowserHistory()
  : createMemoryHistory()

function matchParams(path: string, pathname: string) {
  const matched = match(path)(pathname)
  return matched ? matched.params : {}
}

export const router: Coodev.Router = {
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
  listen(listener: Coodev.RouterListener) {
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
