import { coodev } from '..'

export async function build() {
  const app = coodev({
    dev: false,
  })

  await app.build()
}
