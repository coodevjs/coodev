import * as React from 'react'
// @ts-ignore
import * as ReactDOM from 'react-dom/client'
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

const content = (
  <App
    // @ts-ignore
    Component={matched ? matched.component : 'div'}
    pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
  />
)

const container = document.getElementById(APP_CONTAINER_ID)

if (railingConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  const root = ReactDOM.createRoot(container)

  root.render(content)
}
