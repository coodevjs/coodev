import * as React from 'react'
import { getRuntimeConfig } from '@coodev/react/config'
import './styles.css'

const App: React.FC = ({ Component, pageProps }: any) => {

  const handleClick = () => {
    console.log('clicked', getRuntimeConfig())
  }

  return (
    <div id='app' onClick={handleClick}>
      {Component ? <Component {...pageProps.pageProps} /> : null}
    </div>
  )
}

App.getInitialProps = async ({ Component, req, res }: Coodev.ReactRenderContext) => {
  const pageProps = Component?.getInitialProps
    ? await Component.getInitialProps({ req, res })
    : {}
  return {
    name: 'react-renderer',
    pageProps
  }
}

export default App