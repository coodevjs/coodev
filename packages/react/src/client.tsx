import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import type { GlobalData } from './types'
import routes from '__COODEV__/react/routes'
import coodevConfig from '__COODEV__/react/config'
import CoodevApp from './components/CoodevApp'
import App from '__COODEV__/react/app'
import { COODEV_APP_ID, COODEV_DATA_ID } from './constants'
import { findMatchedRoute } from './utils'

const url = location.pathname + location.search

const matched = findMatchedRoute(url, routes) || {
  component: null,
  path: null,
}

let globalData: GlobalData = {
  pageProps: {},
}

if (coodevConfig.ssr) {
  const scriptElement = document.getElementById(COODEV_DATA_ID)
  if (scriptElement) {
    globalData = JSON.parse(scriptElement!.innerText)
  }
} else if (App.getInitialProps) {
  globalData.pageProps = await App.getInitialProps({
    Component: matched.component,
  })
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
