import * as React from 'react'

export type HeadProps = React.HTMLAttributes<HTMLHeadElement>

const Head: React.FC<HeadProps> = props => {
  return (
    <head {...props} />
  )
}

export default Head