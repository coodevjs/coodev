import * as React from 'react'
import CoodevApp from './CoodevApp'
import { ServerContext } from '../contexts/server'
import { COODEV_APP_ID } from '../constants'

function Main() {
  const context = React.useContext(ServerContext)

  if (!('url' in context)) {
    return <div id={COODEV_APP_ID} />
  }

  return (
    <div id={COODEV_APP_ID}>
      <CoodevApp {...context} />
    </div>
  )
}

export default Main
