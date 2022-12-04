import * as React from 'react'
import coodevConfig from '__COODEV__/config'
import { ServerContext } from '../contexts/server'
import { COODEV_DATA_ID } from '../constants'

const ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

const ESCAPE_REGEX = /[&><\u2028\u2029]/g

function htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match])
}

const CoodevScript: React.FC = () => {
  const { pageProps = {} } = React.useContext(ServerContext)
  return (
    <>
      <script
        type="application/json"
        id={COODEV_DATA_ID}
        dangerouslySetInnerHTML={{
          __html: htmlEscapeJsonString(JSON.stringify({ pageProps })),
        }}
      ></script>
      {coodevConfig.dev && (
        <script type="module" src="/@coodev/react/client"></script>
      )}
    </>
  )
}

export default CoodevScript
