import * as React from 'react'
import { useParams } from '@coodev/react/router'

const Job: React.FC<{ name: string }> = props => {
  const params = useParams<{ id: string; jobId: string }>()

  return (
    <div>
      <h1>
        {params.id}/{params.jobId} - {props.name}
      </h1>
    </div>
  )
}

Job.getInitialProps = async params => {
  console.log('params', params.params)
  return {
    name: 'basic-usage-job',
  }
}

export default Job
