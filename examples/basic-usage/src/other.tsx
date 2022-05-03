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


function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// @ts-ignore
Page.getInitialProps = async () => {
  await sleep(2000)
  return {
    name: 'other'
  }
}

export default Page