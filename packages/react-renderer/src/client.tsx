import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import routes from '__RAILING__/react/routes'
// @ts-ignore
import railingConfig from '__RAILING__/config'
import { APP_CONTAINER_ID } from './constants'
import { __NormalizedRouteConfig__ } from './types'

const matched = (routes as __NormalizedRouteConfig__[]).find(route => {
  return route.path === location.pathname
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
  ReactDOM.createRoot(container).render(content)
}
