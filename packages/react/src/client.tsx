import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { getGlobalData } from './config'
import type { GlobalData, ReactRenderContext } from './types'
import routes from '__COODEV__/react/routes'
import coodevConfig from '__COODEV__/react/config'
import CoodevApp from './components/CoodevApp'
import App from '__COODEV__/react/app'
import { COODEV_APP_ID } from './constants'
import { findMatchedRoute, matchParams } from './utils'
;(async () => {
  const url = location.pathname + location.search

  const matched = findMatchedRoute(url, routes) || {
    component: null,
    path: null,
  }

  let globalData: GlobalData = getGlobalData()

  if (!coodevConfig.ssr && App.getInitialProps) {
    const params = matchParams(matched.path || '/', url)
    const context: ReactRenderContext = {
      Component: matched.component,
      params,
      url,
    }
    globalData.pageProps = await App.getInitialProps(context)
  }

  const content = (
    <CoodevApp
      url={url}
      pathDefinition={matched.path}
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
})()
