import * as React from 'react'
import Link from '@coodev/react/link'

const Workflow: React.FC = () => {
  return (
    <div>
      <h1>Workflow</h1>
      <Link to="/workflows/1/jobs/2">Workflow job</Link>
    </div>
  )
}

export default Workflow
