import * as React from 'react'
import Link from '@coodev/react/link'

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/other">other</Link>
    </div>
  )
}

export default Home
