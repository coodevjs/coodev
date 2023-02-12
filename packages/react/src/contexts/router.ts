import * as React from 'react'
import { Location } from '../types'

export const RouterContext = React.createContext(
  {} as {
    location: Location
    params: object
  },
)
