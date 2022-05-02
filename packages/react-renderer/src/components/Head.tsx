import * as React from 'react'
import railingConfig from '__RAILING__/config'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const isStreamingHtml = (
  typeof railingConfig.ssr === 'object' && !!railingConfig.ssr.streamingHtml
)

const reactFashRefreshCode = `
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
      {isStreamingHtml && (
        <>
          <script
            type='module'
            dangerouslySetInnerHTML={{
              __html: reactFashRefreshCode
            }}
          />
          <script type='module' src='/@vite/client' />
        </>
      )}
    </head>
  )
}

export default Head