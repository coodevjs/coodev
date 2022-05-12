import * as React from 'react'
import {
  renderToString as _renderToString,
  renderToPipeableStream
} from 'react-dom/server'
import { findMatchedRoute } from './utils'
import { CodellContext } from './contexts/codell'
import Document from '__CODELL__/react/document'
import App from '__CODELL__/react/app'
import routes from '__CODELL__/react/routes'

async function renderApp<T>(
  { req }: Codell.RenderContext,
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
    <CodellContext.Provider
      value={{
        Component: matched.component,
        path: matched.path,
        url,
        pageProps,
      }}>
      <Document />
    </CodellContext.Provider>
  )
}

export function renderToStream(ctx: Codell.RenderContext) {
  return renderApp(ctx, content => {
    return renderToPipeableStream(content, {
      onShellReady: () => {
        console.log('shell ready');
      }
    })
  })
}

export async function renderToString(ctx: Codell.RenderContext) {
  return renderApp(ctx, content => {
    return _renderToString(content)
  })
}

export async function getDocumentHtml(ctx: Codell.RenderContext) {
  return _renderToString(<Document />).replace('data-reactroot=""', '')
}