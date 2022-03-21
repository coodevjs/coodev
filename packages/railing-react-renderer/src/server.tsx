import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
// @ts-ignore
import * as routes from '__RAILING__/react/routes'
import { IRailingRenderContext } from '@railing/types'
import { getDefaultDocumentHtml } from './html'
import { IRailingReactRouteConfig } from './types'
import { App } from './App'

export async function renderToHtml({ req }: IRailingRenderContext) {
  const matched = (routes as IRailingReactRouteConfig[]).find(route => {
    return route.path === '/'
  })
  console.log(matched)
  return ReactDOMServer.renderToString(
    <App
      // @ts-ignore
      Component={matched ? matched.component : 'div'}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}

export async function getDocumentHtml(ctx: IRailingRenderContext) {
  return getDefaultDocumentHtml()
}