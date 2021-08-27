import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
// @ts-ignore
import App from '__RAILING__/react/app'
import { IRenderToHTMLOptions } from './types'

const NormalizedApp = App || function (props: any) {
  return props.children
}

export async function renderToHTML({ req }: IRenderToHTMLOptions) {
  return ReactDOMServer.renderToString(
    <NormalizedApp
      Component={'div'}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}