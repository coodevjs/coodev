import * as React from 'react'
import { join } from 'path'
import { access } from 'fs/promises'
import { constants } from 'fs'
import {
  renderToString as _renderToString,
  renderToPipeableStream,
} from 'react-dom/server'
import { findMatchedRoute, matchParams } from './utils'
import { ServerContext, Manifest } from './contexts/server'
import type { ReactRenderContext, ReactCoodevConfiguration } from './types'
import type { RenderContext } from '@coodev/core'
import Document from '__COODEV__/react/document'
import App from '__COODEV__/react/app'
import routes from '__COODEV__/react/routes'

async function loadManifest(
  config: ReactCoodevConfiguration,
): Promise<Manifest> {
  if (!config.dev) {
    try {
      const outputDir = config.outputDir
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
  { req, res, coodevConfig }: RenderContext,
  callback: (content: React.ReactElement) => T,
): Promise<T | void> {
  const url = req.url || '/'
  const config = coodevConfig as ReactCoodevConfiguration

  const matched = findMatchedRoute(url, routes) || {
    component: null,
    path: null,
  }

  let pageProps = {}
  if (App.getInitialProps) {
    const params = matchParams(matched.path || '/', url)

    const context: ReactRenderContext = {
      url,
      req,
      res,
      Component: matched.component,
      params,
    }
    pageProps = await App.getInitialProps(context)
  }

  const manifest = await loadManifest(config)

  return callback(
    <ServerContext.Provider
      value={{
        Component: matched.component,
        path: matched.path,
        url,
        pageProps,
        manifest,
        coodevConfig: config,
      }}
    >
      <Document />
    </ServerContext.Provider>,
  )
}

export function renderToStream(ctx: RenderContext) {
  return renderApp(ctx, content => {
    return renderToPipeableStream(content, {
      onShellReady: () => {
        // TODO: shell ready
      },
    })
  })
}

export async function renderToString(ctx: RenderContext) {
  return renderApp(ctx, content => {
    return _renderToString(content)
  })
}

export async function getDocumentHtml(ctx: RenderContext) {
  return _renderToString(
    <ServerContext.Provider
      value={{
        coodevConfig: ctx.coodevConfig,
      }}
    >
      <Document />
    </ServerContext.Provider>,
  ).replace('data-reactroot=""', '')
}
