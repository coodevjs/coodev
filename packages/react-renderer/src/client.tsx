import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from '__RAILING__/react/app'
import routes from '__RAILING__/react/routes'
import railingConfig from '__RAILING__/config'
import { APP_CONTAINER_ID } from './constants'

const matched = routes.find(route => {
  return route.path === location.pathname
})

const content = (
  <App
    Component={matched!.component}
    pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
  />
)

const container = document.getElementById(APP_CONTAINER_ID) as HTMLElement

if (railingConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  ReactDOM.createRoot(container).render(content)
}
