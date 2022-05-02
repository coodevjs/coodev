import * as React from 'react'
import { renderToString, renderToPipeableStream } from 'react-dom/server'
import { IRailingRenderContext } from '@railing/types'
import { Railing } from './components'
import routes from '__RAILING__/react/routes'
import Document from '__RAILING__/react/document'
import App from '__RAILING__/react/app'

export async function renderToStream({ req, res, next }: IRailingRenderContext) {
  const matched = routes.find(route => {
    return route.path === req.url
  })

  if (!matched) {
    next()
    return
  }

  return renderToPipeableStream((
    <Railing>
      <App
        Component={matched.component}
        pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
      />
    </Railing>
  ), {
    onShellReady: () => {
      console.log('shell ready');

    }
  })
}

export async function renderToHtml({ req, next }: IRailingRenderContext) {
  const matched = routes.find(route => {
    return route.path === req.url
  })

  if (!matched) {
    next()
    return
  }

  return renderToString(
    <Railing>
      <App
        Component={matched.component}
        pageProps={{ style: { backgroundColor: 'blue', height: 200 } }}
      />
    </Railing>
  )
}

export async function getDocumentHtml(ctx: IRailingRenderContext) {
  return renderToString(
    <Railing>
      <Document />
    </Railing>
  ).replace('data-reactroot=""', '')
}