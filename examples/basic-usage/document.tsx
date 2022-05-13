import * as React from 'react'
import { Main, Html, Head, Title, CoodevScript } from '@coodev/react/app'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Customize' />
      </Head>
      <body>
        <Main />
        <CoodevScript />
      </body>
    </Html>
  )
}

export default Document