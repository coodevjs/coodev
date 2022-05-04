import * as React from 'react'
import { getRuntimeConfig } from '@railing/react-renderer/config'
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

// @ts-ignore
App.getInitialProps = async ({ Component, ctx }) => {
  const pageProps = Component ? await Component.getInitialProps(ctx) : {}
  return {
    name: 'react-renderer',
    pageProps
  }
}

export default App