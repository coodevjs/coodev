import * as React from 'react'
import { join } from 'path'
import { access } from 'fs/promises'
import { constants } from 'fs'
import {
  renderToString as _renderToString,
  renderToPipeableStream,
} from 'react-dom/server'
import { findMatchedRoute } from './utils'
import { ServerContext, Manifest } from './contexts/server'
import Document from '__COODEV__/react/document'
import App from '__COODEV__/react/app'
import routes from '__COODEV__/react/routes'
import coodevConfig from '__COODEV__/react/config'

async function loadManifest(): Promise<Manifest> {
  if (!coodevConfig.dev) {
    try {
      const outputDir = coodevConfig.outputDir
      const manifestPath = join(outputDir!, 'manifest.json')

      await access(manifestPath, constants.R_OK)

      return require(manifestPath)
    } catch (error) {
      console.error(error)
    }
  }
  return {}
}

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

  const manifest = await loadManifest()

  return callback(
    <ServerContext.Provider
      value={{
        Component: matched.component,
        path: matched.path,
        url,
        pageProps,
        manifest,
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
        // TODO: shell ready
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
