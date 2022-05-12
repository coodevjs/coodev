import * as React from 'react'
import { Main, Html, Head, Title, CodellScript } from './components'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Document Title' />
      </Head>
      <body>
        <Main />
        <CodellScript />
      </body>
    </Html>
  )
}

export default Document