import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import routes from '__CODELL__/react/routes'
import codellConfig from '__CODELL__/config'
import CodellApp from './components/CodellApp'
import { CODELL_APP_ID, CODELL_DATA_ID } from './constants'
import { findMatchedRoute } from './utils'

let globalData: Codell.GlobalData = {
  pageProps: {}
}

const scriptElement = document.getElementById(CODELL_DATA_ID)
if (scriptElement) {
  globalData = JSON.parse(scriptElement!.innerText)
}

const url = location.pathname + location.search

const matched = findMatchedRoute(url, routes) || {
  component: null,
  path: null
}

const content = (
  <CodellApp
    url={url}
    path={matched.path}
    Component={matched.component}
    pageProps={globalData.pageProps || {}}
  />
)

const container = document.getElementById(CODELL_APP_ID) as HTMLElement

if (codellConfig.ssr) {
  ReactDOM.hydrateRoot(container, content)
} else {
  ReactDOM.createRoot(container).render(content)
}
