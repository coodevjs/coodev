import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import Document from './document'

export function getDefaultDocumentHtml() {
  return ReactDOMServer.renderToString(<Document />).replace('data-reactroot=""', '')
}
