import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import routes from '__COODEV__/react/routes'
import coodevConfig from '__COODEV__/config'
import CoodevApp from './components/CoodevApp'
import { COODEV_APP_ID, COODEV_DATA_ID } from './constants'
import { findMatchedRoute } from './utils'

let globalData: Coodev.GlobalData = {
  pageProps: {}
}

const scriptElement = document.getElementById(COODEV_DATA_ID)
if (scriptElement) {
  globalData = JSON.parse(scriptElement!.innerText)
}

const url = location.pathname + location.search

const matched = findMatchedRoute(url, routes) || {
  component: null,
  path: null
}

const content = (
  <CoodevApp
    url={url}
    path={matched.path}
    Component={matched.component}
    pageProps={globalData.pageProps || {}}
  />
)

const container = document.getElementById(COODEV_APP_ID) as HTMLElement

if (coodevConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  ReactDOM.createRoot(container).render(content)
}
