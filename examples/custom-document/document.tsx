import * as React from 'react'
import { Main, Html, Head, Title, CoodevScript } from '@coodev/react/document'

const Document: React.FC = () => {
  return (
    <Html>
      <Head>
        <Title title="Custom document title" />
      </Head>
      <body>
        <Main />
        <CoodevScript />
      </body>
    </Html>
  )
}

export default Document
