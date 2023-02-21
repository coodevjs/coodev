import { coodev } from '..'

export interface CoodevStartOptions {
  root?: string
  dev: boolean
  port: string
  host: string
}

export async function start(options: CoodevStartOptions) {
  const app = coodev({
    ...options,
    port: +options.port || 3000,
  })

  await app.start()
}
