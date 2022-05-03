import * as React from 'react'
import Document from '__RAILING__/react/document'
import { RailingContext } from '../contexts/railing'

interface RootProps {
  url: string
  path: string
  Component: React.ComponentType<any>
  pageProps: object
}

function Root(props: RootProps) {
  return (
    <RailingContext.Provider value={props}>
      <Document />
    </RailingContext.Provider>
  )
}

export default Root