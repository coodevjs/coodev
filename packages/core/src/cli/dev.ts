import { createCoodev } from '../coodev'

export function dev() {
  const coodev = createCoodev({
    dev: true,
  })

  coodev.start()
}
