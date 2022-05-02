import * as React from 'react'
import { Main, Html, Head, Title, RailingScript } from './components'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Document Title' />
      </Head>
      <body>
        <Main />
        <RailingScript />
      </body>
    </Html>
  )
}

export default Document