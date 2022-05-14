import * as React from 'react'
import { RouterContext } from '../contexts/router'

export function useLocation() {
  return React.useContext(RouterContext).location
}

export function useParams<T>(): T {
  return React.useContext(RouterContext).params as any as T
}
