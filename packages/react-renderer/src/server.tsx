import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
// @ts-ignore
import routes from '__RAILING__/react/routes'
// @ts-ignore
import App from '__RAILING__/react/app'
// @ts-ignore
import Document from '__RAILING__/react/document'
// @ts-ignore
import railingConfig from '__RAILING__/config'
import { IRailingRenderContext } from '@railing/types'
import { IRailingReactRouteConfig } from './types'

export async function renderToHtml({ req }: IRailingRenderContext) {
  console.log(railingConfig);

  console.log(routes)
  const matched = (routes as IRailingReactRouteConfig[] || []).find(route => {
    return route.path === '/'
  })

  console.log(matched);



  return ReactDOMServer.renderToString(
    <App
      // @ts-ignore
      Component={matched ? matched.component : 'div'}
      pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
    />
  )
}

export async function getDocumentHtml(ctx: IRailingRenderContext) {
  return ReactDOMServer.renderToString(<Document />).replace('data-reactroot=""', '')
}