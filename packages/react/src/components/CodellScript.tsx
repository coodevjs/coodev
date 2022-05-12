import * as React from 'react'
import { CodellContext } from '../contexts/codell'
import { CODELL_DATA_ID } from '../constants'

const ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

const ESCAPE_REGEX = /[&><\u2028\u2029]/g

function htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match])
}

const CodellScript: React.FC = () => {
  const { pageProps = {} } = React.useContext(CodellContext)
  return (
    <>
      <script
        type='application/json'
        id={CODELL_DATA_ID}
        dangerouslySetInnerHTML={{
          __html: htmlEscapeJsonString(JSON.stringify({ pageProps }))
        }}>
      </script>
      <script type='module' src='/@codell/react/client'></script>
    </>
  )
}

export default CodellScript