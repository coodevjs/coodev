import * as React from 'react'
import { IRailingReactAppProps } from './types'

const App = ({ Component, pageProps }: IRailingReactAppProps) => {
  return <Component {...pageProps} />
}

export default App