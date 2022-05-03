import * as React from 'react'
import { router } from '@railing/react-renderer/router'
import { Link } from '@railing/react-renderer/app'

const Page: React.FC = (props) => {
  console.log(props);

  const [count, setCount] = React.useState(0)

  const handleClick = () => {
    setTimeout(() => {
      setCount(count => count + 1)
      setCount(count => count + 1)
    }, 0);
  }

  return (
    <div id='home' onClick={handleClick}>
      <h1>{`Home ${count}`}</h1>
      <Link to='/other'>to 422</Link>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// @ts-ignore
Page.getInitialProps = async () => {
  await sleep(1000)
  return {
    name: 'home'
  }
}

export default Page