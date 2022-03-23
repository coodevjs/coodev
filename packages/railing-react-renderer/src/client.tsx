import * as React from 'react'
import * as ReactDOM from 'react-dom'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import * as routes from '__RAILING__/react/routes'
// @ts-ignore
import * as railingConfig from '__RAILING__/config'
import { APP_CONTAINER_ID } from './constants'
import { IRailingReactRouteConfig } from './types'

const matched = (routes as IRailingReactRouteConfig[]).find(route => {
  return route.path === '/'
})

const container = document.getElementById(APP_CONTAINER_ID)
const content = (
  <App
    // @ts-ignore
    Component={matched ? matched.component : 'div'}
    pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
  />
)

if (railingConfig.ssr) {
  ReactDOM.hydrate(content, container)
} else {
  ReactDOM.render(content, container)
}
