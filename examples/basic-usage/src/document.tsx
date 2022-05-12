import * as React from 'react'
import { Main, Html, Head, Title, CodellScript } from '@codell/react/app'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title='Customize' />
      </Head>
      <body>
        <Main />
        <CodellScript />
      </body>
    </Html>
  )
}

export default Document