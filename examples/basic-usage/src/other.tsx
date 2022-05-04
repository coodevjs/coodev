import * as React from 'react'

const Page: React.FC = () => {
  const handleClick = () => {
    console.log('other clicked')
  }
  return (
    <div id='other' onClick={handleClick}>
      <h1>Other</h1>
    </div>
  )
}

// @ts-ignore
Page.getInitialProps = async () => {
  return {
    name: 'other'
  }
}

export default Page