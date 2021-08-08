import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
// @ts-ignore
import App from '__RAILING__/react/app'
import type { IncomingMessage } from 'http'

const NormalizedApp = App || function (props: any) {
  return props.children
}

export function renderToHTML({ req }: { req: IncomingMessage }) {
  return ReactDOMServer.renderToString(
    <NormalizedApp
      Component={'div'}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}