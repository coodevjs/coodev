import * as React from 'react'

const App: React.FC = ({ Component, pageProps }: any) => {
  return (
    <div id='app'>
      <Component {...pageProps} />
    </div>
  )
}

export default App