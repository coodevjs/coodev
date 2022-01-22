import * as React from 'react'

const Page: React.FC = () => {
  const handleClick = () => {
    console.log('home clicked')
  }
  return (
    <div id='home' onClick={handleClick}>
      <h1>Home</h1>
    </div>
  )
}

export default Page