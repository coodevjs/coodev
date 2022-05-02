import * as React from 'react'

// const clientEntryPath = path.resolve(import.meta.url, '../client.tsx')

const RailingScript: React.FC = () => {
  return (
    <>
      <script type='module' src='/__RAILING__/react/client'></script>
    </>
  )
}

export default RailingScript