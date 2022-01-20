import * as React from 'react'
import * as ReactDOM from 'react-dom'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import * as routes from '__RAILING__/react/routes'
import { APP_CONTAINER_ID } from './constants'
import { IRailingReactRouteConfig } from './types'

const NormalizedApp = App || function (props: any) {
  return props.children
}

const matched = (routes as IRailingReactRouteConfig[]).find(route => {
  return route.path === '/'
})
console.log(matched)

ReactDOM.hydrate(
  <NormalizedApp
    Component={matched ? matched.component : 'div'}
    pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
  />,
  document.getElementById(APP_CONTAINER_ID)
)