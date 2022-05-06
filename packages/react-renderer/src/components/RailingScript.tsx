import * as React from 'react'
import { RailingContext } from '../contexts/railing'
import { RAILING_DATA_ID } from '../constants'

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

const RailingScript: React.FC = () => {
  const { pageProps = {} } = React.useContext(RailingContext)
  return (
    <>
      <script
        type='application/json'
        id={RAILING_DATA_ID}
        dangerouslySetInnerHTML={{
          __html: htmlEscapeJsonString(JSON.stringify({ pageProps }))
        }}>
      </script>
      <script type='module' src='/@railing/react/client'></script>
    </>
  )
}

export default RailingScript