import * as React from 'react'
import { renderToString as render, renderToPipeableStream } from 'react-dom/server'
import { IRailingRenderContext } from '@railing/types'
import routes from '__RAILING__/react/routes'
import RailingApp from './railing-app'

export async function renderToStream({ req, next }: IRailingRenderContext) {
  const matched = routes.find(route => {
    return route.path === req.url
  })

  if (!matched) {
    next()
    return
  }

  return renderToPipeableStream(<RailingApp />, {
    onShellReady: () => {
      console.log('shell ready');

    }
  })
}

export async function renderToString({ req, next }: IRailingRenderContext) {
  const matched = routes.find(route => {
    return route.path === req.url
  })

  if (!matched) {
    next()
    return
  }

  return render(<RailingApp />)
}

export async function getDocumentHtml(ctx: IRailingRenderContext) {
  return render(<RailingApp />).replace('data-reactroot=""', '')
}