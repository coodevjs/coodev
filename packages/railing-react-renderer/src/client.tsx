import * as React from 'react'
import * as ReactDOM from 'react-dom'
// @ts-ignore
import App from '__RAILING__/react/app'
import { APP_CONTAINER_ID } from './constants'

const NormalizedApp = App || function (props: any) {
  return props.children
}

ReactDOM.hydrate(
  <NormalizedApp
    Component={'div'}
    pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
  />,
  document.getElementById(APP_CONTAINER_ID)
)