import * as React from 'react'
import Link from '@coodev/react/link'

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/other">other</Link>
      <Link to="/coodevjs/coodev/workflow-runs">
        coodevjs/coodev workflow runs
      </Link>
      <button onClick={() => console.log('clicked')}>Click</button>
    </div>
  )
}

export default Home
