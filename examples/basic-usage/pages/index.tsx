import * as React from 'react'
import { getRuntimeConfig } from '@coodev/react/config'
import Link from '@coodev/react/link'

interface HomeProps {
  name: string
}

const Home: React.FC<HomeProps> = () => {
  const [count, setCount] = React.useState(0)

  const handleClick = () => {
    setTimeout(() => {
      setCount(count => count + 1)
      setCount(count => count + 1)
    }, 0)
  }

  return (
    <div id="home">
      <h1 onClick={handleClick}>{`Home ${count} - ${
        getRuntimeConfig().name
      }`}</h1>
      <Link to="/?a=2">to home</Link>
      <br />
      <Link to="/other">to other</Link>
      <br />
      <Link to="/info/test">to info/test</Link>
    </div>
  )
}

Home.getInitialProps = async () => {
  return {
    name: 'home',
  }
}

export default Home
