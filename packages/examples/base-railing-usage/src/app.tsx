import * as React from 'react'

const App: React.FC = ({ Component, pageProps }: any) => {
  const handleClick = () => {
    console.log('clicked')
  }
  return (
    <div id='app' onClick={handleClick}>
      <Component {...pageProps} />
    </div>
  )
}

export default App