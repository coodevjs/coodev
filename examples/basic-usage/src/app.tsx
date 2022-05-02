import * as React from 'react'
import { getRuntimeConfig } from '@railing/react-renderer/config'

const App: React.FC = ({ Component, pageProps }: any) => {

  const handleClick = () => {
    console.log('clicked', getRuntimeConfig())
  }
  return (
    <div id='app' style={{ width: 200, height: 300, background: 'red' }} onClick={handleClick}>
      <Component {...pageProps} />
    </div>
  )
}

export default App