import * as React from 'react'
import { App, Html, Head, Title } from './components'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Document Title' />
      </Head>
      <body>
        <App />
      </body>
    </Html>
  )
}

export default Document