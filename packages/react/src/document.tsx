import * as React from 'react'
import { Main, Html, Head, Title, CoodevScript } from './components'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Document Title' />
      </Head>
      <body>
        <Main />
        <CoodevScript />
      </body>
    </Html>
  )
}

export default Document