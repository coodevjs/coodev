import * as React from 'react'
import { APP_CONTAINER_ID, CONTENT_REPLACEMENT } from '../constants'

const App: React.FC = () => {
  return (
    <div id={APP_CONTAINER_ID}>
      {CONTENT_REPLACEMENT}
    </div>
  )
}

export default App