import * as React from 'react'
import { useParams, useLocation } from '@railing/react-renderer/router'
import { Link } from '@railing/react-renderer/app'

const Page: React.FC = (props) => {
  const location = useLocation()
  const params = useParams()
  const [count, setCount] = React.useState(0)

  console.log(location, params);

  const handleClick = () => {
    setTimeout(() => {
      setCount(count => count + 1)
      setCount(count => count + 1)
    }, 0);
  }

  return (
    <div id='home'>
      <h1 onClick={handleClick}>{`Home ${count}`}</h1>
      <Link to='/other'>to other</Link>
      <br />
      <Link to='/info/test'>to info/test</Link>
    </div>
  )
}

// @ts-ignore
Page.getInitialProps = async () => {
  return {
    name: 'home'
  }
}

export default Page