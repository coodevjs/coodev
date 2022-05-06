import * as React from 'react'
import RailingApp from './RailingApp'
import { RailingContext } from '../contexts/railing'
import { RAILING_APP_ID } from '../constants'

function Main() {
  const context = React.useContext(RailingContext)

  if (!context.url) {
    return <div id={RAILING_APP_ID} />
  }

  return (
    <div id={RAILING_APP_ID}>
      <RailingApp {...context} />
    </div>
  )
}

export default Main