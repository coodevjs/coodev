import * as React from 'react'
import { useParams } from '@coodev/react/router'

interface Params {
  owner: string
  repository: string
}

const WorkflowRuns: React.FC = () => {
  const { owner, repository } = useParams<Params>()
  return (
    <div>
      <h1>
        {owner}/{repository}
      </h1>
    </div>
  )
}

export default WorkflowRuns
