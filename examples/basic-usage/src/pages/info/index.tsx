import * as React from 'react'

const Page: React.FC = () => {

  return (
    <div>
      <h1>Info</h1>
    </div>
  )
}

Page.getInitialProps = async () => {
  return {
    name: 'other'
  }
}

export default Page