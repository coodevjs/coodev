import * as React from 'react'
import { getRuntimeConfig } from '@coodev/react/config'
import Link from '@coodev/react/link'
import './styles.css'

const runtimeConfig = getRuntimeConfig()

const Home: React.FC = () => {
  return (
    <div className="container">
      <h1>Home</h1>
      <Link to="/other">other</Link>
      <br />
      <Link to="/coodevjs/coodev">coodevjs/coodev</Link>
      <br />
      <button onClick={() => console.log('clicked')}>Click</button>
    </div>
  )
}

export default Home
