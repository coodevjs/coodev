import * as React from 'react'
import { Main, Html, Head, Title, RailingScript } from '@railing/react-renderer/app'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Customize' />
      </Head>
      <body>
        <Main />
        <RailingScript />
      </body>
    </Html>
  )
}

export default Document