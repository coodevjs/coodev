import * as React from 'react'
import { router } from '@railing/react-renderer/router'

const Page: React.FC = () => {
  const [count, setCount] = React.useState(0)
  const handleClick = () => {
    setTimeout(() => {
      setCount(count => count + 1)
      setCount(count => count + 1)
    }, 0);

    router.push('/')
  }
  console.count('render')
  return (
    <div id='home' onClick={handleClick}>
      <h1>Home {count}</h1>
    </div>
  )
}

export default Page