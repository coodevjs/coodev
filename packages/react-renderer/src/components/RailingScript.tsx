import * as React from 'react'
import { GLOBAL_DATA_ELEMENT_ID } from '../constants'

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
  return (
    <>
      <script
        type='application/json'
        id={GLOBAL_DATA_ELEMENT_ID}
        dangerouslySetInnerHTML={{
          __html: htmlEscapeJsonString(JSON.stringify({ a: 1 }))
        }}>
      </script>
      <script type='module' src='/@railing/react/client'></script>
    </>
  )
}

export default RailingScript