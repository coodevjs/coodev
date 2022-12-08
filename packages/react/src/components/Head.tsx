import * as React from 'react'
import coodevConfig from '__COODEV__/react/config'
import { ServerContext } from '../contexts/server'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const reactFastRefreshCode = `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`

const Head: React.FC<HeadProps> = ({ children, ...otherProps }) => {
  const { manifest } = React.useContext(ServerContext)
  const manifestChildren: React.ReactNode[] = []
  if (manifest) {
    const entryChunk = Object.values(manifest).find(chunk => chunk.isEntry)
    if (entryChunk) {
      const cssResources = entryChunk.css
      if (cssResources) {
        cssResources.forEach((cssResource: string) => {
          manifestChildren.push(
            <link
              key={cssResource}
              rel="stylesheet"
              href={`/${cssResource}`}
            />,
          )
        })
      }

      manifestChildren.push(
        <script
          type="module"
          crossOrigin="anonymous"
          key={entryChunk.file}
          src={`/${entryChunk.file}`}
        />,
      )
    }
  }

  return (
    <head {...otherProps}>
      {children}
      {!!coodevConfig.dev && (
        <>
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: reactFastRefreshCode,
            }}
          />
          <script type="module" src="/@vite/client" />
        </>
      )}
      {manifestChildren}
    </head>
  )
}

export default Head
