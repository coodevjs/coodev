import * as React from 'react'
import { ServerContext } from '../contexts/server'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const Head: React.FC<HeadProps> = ({ children, ...otherProps }) => {
  const context = React.useContext(ServerContext)
  const coodevConfig = context.coodevConfig
  const publicPath = coodevConfig.publicPath as string
  const manifestChildren: React.ReactNode[] = []
  if ('manifest' in context) {
    const entryChunk = Object.values(context.manifest).find(
      chunk => chunk.isEntry,
    )
    if (entryChunk) {
      if (entryChunk.css) {
        entryChunk.css.forEach((path: string) => {
          manifestChildren.push(
            <link key={path} rel="stylesheet" href={publicPath + path} />,
          )
        })
      }

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

  return (
    <head {...otherProps}>
      {children}
      {!!coodevConfig.dev && (
        <>
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `
              import RefreshRuntime from "${publicPath}@react-refresh"
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
              `,
            }}
          />
          <script type="module" src={publicPath + '@vite/client'} />
        </>
      )}
      {manifestChildren}
    </head>
  )
}

export default Head
