import * as React from 'react'
import { renderToString } from 'react-dom/server'
// @ts-ignore
import routes from '__RAILING__/react/routes'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import Document from '__RAILING__/react/document'
import { IRailingRenderContext } from '@railing/types'
import { __NormalizedRouteConfig__ } from './types'


export async function renderToHtml({ req }: IRailingRenderContext) {
  const matched = (routes as __NormalizedRouteConfig__[]).find(route => {
    return route.path === req.url
  })

  return renderToString(
    <App
      Component={matched ? matched.component : 'div'}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}

export async function getDocumentHtml(ctx: IRailingRenderContext) {
  return renderToString(<Document />).replace('data-reactroot=""', '')
}