import * as React from 'react'
import { router } from '../router'

const Link: React.FC<Railing.LinkProps> = ({
  to, onClick, ...otherProps
}) => {
  const handler = React.useCallback(
    (evt: React.MouseEvent) => {
      if (onClick) {
        onClick(evt as any)
      }
      if (!evt.isDefaultPrevented()) {
        evt.preventDefault()
        router.push(to)
      }
    },
    [to, onClick]
  )

  return (
    <a onClick={handler} href={to} {...otherProps} />
  )
}

export default Link