import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import routes from '__RAILING__/react/routes'
import { IRenderToHTMLOptions, IRailingReactRouteConfig } from './types'

const NormalizedApp = App || function (props: any) {
  return props.children
}

export async function renderToHTML({ req }: IRenderToHTMLOptions) {
  const matched = (routes as IRailingReactRouteConfig[]).find(route => {
    return route.path === '/'
  })
  console.log(matched)
  return ReactDOMServer.renderToString(
    <NormalizedApp
      // @ts-ignore
      Component={matched?.component.default}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}