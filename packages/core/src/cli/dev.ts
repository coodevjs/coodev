import { createRailing } from '../railing'

export function dev() {
  const railing = createRailing({
    dev: true,
  })

  railing.start()
}
