import * as React from 'react'
import { ServerContext } from '../contexts/server'
import { COODEV_DATA_ID } from '../constants'
import type { GlobalData } from '../types'

const ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

const ESCAPE_REGEX = /[&><\u2028\u2029]/g

function htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match])
}

const CoodevScript: React.FC = () => {
  const context = React.useContext(ServerContext)
  const coodevConfig = context.coodevConfig
  const publicPath = coodevConfig.publicPath as string

  const manifestChildren: React.ReactNode[] = []
  if ('manifest' in context) {
    const entryChunk = Object.values(context.manifest).find(
      chunk => chunk.isEntry,
    )

    if (entryChunk) {
      manifestChildren.push(
        <script
          type="module"
          crossOrigin="anonymous"
          key={entryChunk.file}
          src={publicPath + entryChunk.file}
        />,
      )
    }
  }

  const globalData: GlobalData = {
    publicPath,
    pageProps: 'pageProps' in context ? context.pageProps : {},
    runtimeConfig: coodevConfig.runtimeConfig || {},
  }
  return (
    <>
      {coodevConfig.ssr !== false && (
        <script
          type="application/json"
          id={COODEV_DATA_ID}
          dangerouslySetInnerHTML={{
            __html: htmlEscapeJsonString(JSON.stringify(globalData)),
          }}
        />
      )}
      {(coodevConfig.dev || !coodevConfig.ssr) && (
        <script type="module" src={publicPath + '@coodev/react/client'} />
      )}
      {manifestChildren}
    </>
  )
}

export default CoodevScript
