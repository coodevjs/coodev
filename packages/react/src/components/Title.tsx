import * as React from 'react'

export interface TitleProps {
  title: string
}

const Title: React.FC<TitleProps> = props => {
  return (
    <title>{props.title}</title>
  )
}

export default Title