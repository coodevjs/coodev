import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import routes from '__RAILING__/react/routes'
import railingConfig from '__RAILING__/config'
import RailingApp from './components/RailingApp'
import { APP_CONTAINER_ID, GLOBAL_DATA_ELEMENT_ID } from './constants'
import { findMatchedRoute } from './utils'

let globalData: Railing.GlobalData = {
  pageProps: {}
}

const scriptElement = document.getElementById(GLOBAL_DATA_ELEMENT_ID)
if (scriptElement) {
  globalData = JSON.parse(scriptElement!.innerText)
}

// TODO matched may be undefined
const matched = findMatchedRoute(window.location.pathname, routes)

const content = (
  <RailingApp
    url={window.location.href}
    path={matched!.path}
    Component={matched ? matched.component as any : null}
    pageProps={globalData.pageProps || {}}
  />
)

const container = document.getElementById(APP_CONTAINER_ID) as HTMLElement

if (railingConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  ReactDOM.createRoot(container).render(content)
}
