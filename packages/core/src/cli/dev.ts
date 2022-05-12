import { createCodell } from '../codell'

export function dev() {
  const codell = createCodell({
    dev: true,
  })

  codell.start()
}
