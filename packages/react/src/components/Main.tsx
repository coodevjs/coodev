import * as React from 'react'
import CoodevApp from './CoodevApp'
import { CoodevContext } from '../contexts/coodev'
import { COODEV_APP_ID } from '../constants'

function Main() {
  const context = React.useContext(CoodevContext)

  if (!context.url) {
    return <div id={COODEV_APP_ID} />
  }

  return (
    <div id={COODEV_APP_ID}>
      <CoodevApp {...context} />
    </div>
  )
}

export default Main