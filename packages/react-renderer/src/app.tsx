import * as React from 'react'

const App = ({ Component, pageProps }: Railing.AppProps) => {
  return Component ? <Component {...pageProps} /> : null
}

// @ts-ignore
App.getInitialProps = async ({ Component, ctx }) => {
  const pageProps = Component ? await Component.getInitialProps(ctx) : {}

  return pageProps
}

export default App