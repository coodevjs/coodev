import * as React from 'react'
import { getRuntimeConfig } from '@coodev/react/config'
import Link from '@coodev/react/link'

const runtimeConfig = getRuntimeConfig()

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/other?a=1&b=2">other</Link>
      <Link to="/coodevjs/coodev/workflow-runs">
        coodevjs/coodev workflow runs
      </Link>
      <button onClick={() => console.log('clicked', runtimeConfig)}>
        Click
      </button>
    </div>
  )
}

export default Home
