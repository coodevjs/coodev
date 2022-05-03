import * as React from 'react'
import RailingApp from './RailingApp'
import { RailingContext } from '../contexts/railing'
import { APP_CONTAINER_ID } from '../constants'

function Main() {
  const context = React.useContext(RailingContext)

  if (!context.url) {
    return <div id={APP_CONTAINER_ID} />
  }

  return (
    <div id={APP_CONTAINER_ID}>
      <RailingApp {...context} />
    </div>
  )
}

export default Main