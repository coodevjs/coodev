import * as React from 'react'
import {
  renderToString as _renderToString,
  renderToPipeableStream
} from 'react-dom/server'
import { pathToRegexp } from 'path-to-regexp'
import { URL } from 'url'
import routes from '__RAILING__/react/routes'
import RailingApp from './railing-app'

function findMatchedRoute(
  url: string,
  routes: Railing.InternalRouteConfig[] = []
) {
  // 通配符
  const wildcard = '(.*)'
  const parsedUrl = new URL(url)
  const matched = routes
    .map(route => {
      if (route.path === '*') {
        return {
          ...route,
          path: wildcard,
        }
      }
      return route
    })
    .find(route => {
      return pathToRegexp(route.path).test(parsedUrl.pathname)
    })

  return matched
}

async function renderApp<T>(
  { req, next }: Railing.RenderContext,
  callback: (content: React.ReactElement) => T
): Promise<T | void> {
  const matched = findMatchedRoute(req.url || '/', routes)

  if (!matched) {
    return next()
  }

  return callback(<RailingApp />)
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
  return _renderToString(<RailingApp />).replace('data-reactroot=""', '')
}