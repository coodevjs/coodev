import * as React from 'react'

const App = ({ Component, pageProps }: Coodev.AppProps) => {
  return Component ? <Component {...pageProps} /> : null
}

App.getInitialProps = async ({ Component, req, res }: Coodev.ReactRenderContext) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps({ req, res })
    : {}

  return pageProps
}

export default App