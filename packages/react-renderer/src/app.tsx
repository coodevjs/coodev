import * as React from 'react'

const App = ({ Component, pageProps }: IRailingReactAppProps) => {
  return <Component {...pageProps} />
}

export default App