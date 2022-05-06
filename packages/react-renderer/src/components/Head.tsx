import * as React from 'react'
import railingConfig from '__RAILING__/config'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const reactFastRefreshCode = `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`

const Head: React.FC<HeadProps> = ({ children, ...otherProps }) => {
  return (
    <head {...otherProps}>
      {children}
      {!!railingConfig.dev && (
        <>
          <script
            type='module'
            dangerouslySetInnerHTML={{
              __html: reactFastRefreshCode
            }}
          />
          <script type='module' src='/@vite/client' />
        </>
      )}
    </head>
  )
}

export default Head