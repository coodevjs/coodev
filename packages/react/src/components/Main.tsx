import * as React from 'react'
import CodellApp from './CodellApp'
import { CodellContext } from '../contexts/codell'
import { CODELL_APP_ID } from '../constants'

function Main() {
  const context = React.useContext(CodellContext)

  if (!context.url) {
    return <div id={CODELL_APP_ID} />
  }

  return (
    <div id={CODELL_APP_ID}>
      <CodellApp {...context} />
    </div>
  )
}

export default Main