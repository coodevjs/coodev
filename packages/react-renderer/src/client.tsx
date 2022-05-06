import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import routes from '__RAILING__/react/routes'
import railingConfig from '__RAILING__/config'
import RailingApp from './components/RailingApp'
import { RAILING_APP_ID, RAILING_DATA_ID } from './constants'
import { findMatchedRoute } from './utils'

let globalData: Railing.GlobalData = {
  pageProps: {}
}

const scriptElement = document.getElementById(RAILING_DATA_ID)
if (scriptElement) {
  globalData = JSON.parse(scriptElement!.innerText)
}

const url = location.pathname + location.search

const matched = findMatchedRoute(url, routes) || {
  component: null,
  path: null
}

const content = (
  <RailingApp
    url={url}
    path={matched.path}
    Component={matched.component}
    pageProps={globalData.pageProps || {}}
  />
)

const container = document.getElementById(RAILING_APP_ID) as HTMLElement

if (railingConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  ReactDOM.createRoot(container).render(content)
}
