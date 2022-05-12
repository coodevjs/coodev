import * as React from 'react'
import { Location } from 'history'

export const RouterContext = React.createContext(
  {} as {
    location: Location
    params: object
  },
)
