import * as React from 'react'
import { router } from '../router'

export interface LinkProps
  extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

const Link: React.FC<LinkProps> = ({ to, onClick, ...otherProps }) => {
  const handler = React.useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(evt)
      }
      if (!evt.isDefaultPrevented()) {
        evt.preventDefault()
        router.push(to)
      }
    },
    [to, onClick],
  )

  return <a onClick={handler} href={to} {...otherProps} />
}

export default Link
