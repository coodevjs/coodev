import * as React from 'react'

export type HtmlProps = React.HtmlHTMLAttributes<HTMLHtmlElement>

const Html: React.FC<HtmlProps> = props => {
  return <html {...props} />
}

export default Html
