import * as React from 'react'
import type { AppProps, ReactRenderContext } from './types'

const App = ({ Component, pageProps }: AppProps) => {
  return Component ? <Component {...pageProps} /> : null
}

App.getInitialProps = async ({ Component, req, res }: ReactRenderContext) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps({ req, res })
    : {}

  return pageProps
}

export default App
