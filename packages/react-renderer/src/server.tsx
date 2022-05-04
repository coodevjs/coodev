import * as React from 'react'
import {
  renderToString as _renderToString,
  renderToPipeableStream
} from 'react-dom/server'
import { findMatchedRoute } from './utils'
import { RailingContext } from './contexts/railing'
import Document from '__RAILING__/react/document'
import App from '__RAILING__/react/app'
import routes from '__RAILING__/react/routes'

async function renderApp<T>(
  { req }: Railing.RenderContext,
  callback: (content: React.ReactElement) => T
): Promise<T | void> {
  const url = req.url || '/'

  const matched = findMatchedRoute(url, routes) || {
    component: null,
    path: null
  }

  let pageProps = {}
  if (App.getInitialProps) {
    pageProps = await App.getInitialProps({
      req,
      Component: matched.component
    })
  }

  return callback(
    <RailingContext.Provider value={{
      Component: matched.component,
      path: matched.path,
      url,
      pageProps,
    }}>
      <Document />
    </RailingContext.Provider>
  )
}

export function renderToStream(ctx: Railing.RenderContext) {
  return renderApp(ctx, content => {
    return renderToPipeableStream(content, {
      onShellReady: () => {
        console.log('shell ready');
      }
    })
  })
}

export async function renderToString(ctx: Railing.RenderContext) {
  return renderApp(ctx, content => {
    return _renderToString(content)
  })
}

export async function getDocumentHtml(ctx: Railing.RenderContext) {
  return _renderToString(<Document />).replace('data-reactroot=""', '')
}