import * as React from 'react'
import railingConfig from '__RAILING__/config'
import routes from '__RAILING__/react/routes'
import App from '__RAILING__/react/app'
import { APP_CONTAINER_ID } from '../constants'

const MainForCSR: React.FC = () => {
  return (
    <div id={APP_CONTAINER_ID}></div>
  )
}

const MainForSSR: React.FC = () => {
  const matched = routes.find(route => {
    return route.path === '/'
  })

  return (
    <div id={APP_CONTAINER_ID}>
      <App
        Component={matched!.component}
        pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
      />
    </div>
  )
}

export default railingConfig.ssr ? MainForSSR : MainForCSR