import * as React from 'react'

const App = ({ Component, pageProps }: Railing.AppProps) => {
  return Component ? <Component {...pageProps} /> : null
}

App.getInitialProps = async ({ Component, req, res }: Railing.ReactRenderContext) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps({ req, res })
    : {}

  return pageProps
}

export default App