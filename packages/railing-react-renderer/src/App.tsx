import * as React from 'react'
// @ts-ignore
import CostomizeApp from '__RAILING__/react/app'
import { IRailingReactAppProps } from './types'

console.log(CostomizeApp)

const RailingReactApp = ({ Component, pageProps }: IRailingReactAppProps) => {
  return <Component {...pageProps} />
}

export const App = (CostomizeApp || RailingReactApp) as React.FC<IRailingReactAppProps>