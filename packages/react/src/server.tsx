import * as React from 'react'
import {
  renderToString as _renderToString,
  renderToPipeableStream,
} from 'react-dom/server'
import { findMatchedRoute } from './utils'
import { ServerContext } from './contexts/server'
import Document from '__COODEV__/react/document'
import App from '__COODEV__/react/app'
import routes from '__COODEV__/react/routes'

async function renderApp<T>(
  { req }: Coodev.RenderContext,
  callback: (content: React.ReactElement) => T,
): Promise<T | void> {
  const url = req.url || '/'

  const matched = findMatchedRoute(url, routes) || {
    component: null,
    path: null,
  }

  let pageProps = {}
  if (App.getInitialProps) {
    pageProps = await App.getInitialProps({
      req,
      Component: matched.component,
    })
  }

  return callback(
    <ServerContext.Provider
      value={{
        Component: matched.component,
        path: matched.path,
        url,
        pageProps,
      }}
    >
      <Document />
    </ServerContext.Provider>,
  )
}

export function renderToStream(ctx: Coodev.RenderContext) {
  return renderApp(ctx, content => {
    return renderToPipeableStream(content, {
      onShellReady: () => {
        console.log('shell ready')
      },
    })
  })
}

export async function renderToString(ctx: Coodev.RenderContext) {
  return renderApp(ctx, content => {
    return _renderToString(content)
  })
}

export async function getDocumentHtml(ctx: Coodev.RenderContext) {
  return _renderToString(<Document />).replace('data-reactroot=""', '')
}
