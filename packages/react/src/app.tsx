import * as React from 'react'
import type { AppProps, ReactRenderContext } from './types'

const App = ({ Component, pageProps }: AppProps) => {
  return Component ? <Component {...pageProps} /> : null
}

App.getInitialProps = async ({ Component, ...rest }: ReactRenderContext) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps(rest)
    : {}

  return pageProps
}

export default App
