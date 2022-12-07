import * as React from 'react'
import { useParams } from '@coodev/react/router'
import Link from '@coodev/react/link'

const Page: React.FC = () => {
  const params = useParams<{ id: string }>()

  return (
    <div id="info">
      <h1>/info/{params.id}</h1>
      <Link to="/?a=2">to home</Link>
    </div>
  )
}

export default Page
