import * as React from 'react'

const App = ({ Component, pageProps }: any) => {
  return (
    <div>
      <h1>App</h1>
      {Component ? <Component {...pageProps} /> : null}
    </div>
  )
}

App.getInitialProps = async ({ Component, ...rest }: any) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps(rest)
    : {}

  return pageProps
}

export default App
