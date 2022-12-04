import * as React from 'react'
import * as path from 'path'
import * as fs from 'fs'
import coodevConfig from '__COODEV__/config'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const reactFastRefreshCode = `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`

const Head: React.FC<HeadProps> = ({ children, ...otherProps }) => {
  const manifestChildren: React.ReactNode[] = []
  if (!coodevConfig.dev) {
    const outputDir = coodevConfig.outputDir
    const manifestPath = path.join(outputDir!, 'manifest.json')

    if (fs.existsSync(manifestPath)) {
      const manifest = require(manifestPath)
      const htmlResources = manifest['main']
      if (htmlResources) {
        const cssResources = htmlResources.css
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
        const jsResource = htmlResources.file
        if (jsResource) {
          manifestChildren.push(
            <script
              type="module"
              crossOrigin="anonymous"
              key={jsResource}
              src={`/${jsResource}`}
            />,
          )
        }
      }
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
