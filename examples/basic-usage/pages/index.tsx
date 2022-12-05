import * as React from 'react'
import { useParams, useLocation } from '@coodev/react/router'
import { Link } from '@coodev/react/app'
import { getRuntimeConfig } from '@coodev/react/config'

interface HomeProps {
  name: string
}

const Home: React.FC<HomeProps> = props => {
  const location = useLocation()
  const params = useParams()
  const [count, setCount] = React.useState(0)

  console.log('location', location)
  console.log('params', params)
  console.log('runtimeConfig', getRuntimeConfig())

  const handleClick = () => {
    setTimeout(() => {
      setCount(count => count + 1)
      setCount(count => count + 1)
    }, 0)
  }

  return (
    <div id="home">
      <h1 onClick={handleClick}>{`Home ${count}`}</h1>
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
