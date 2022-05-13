import { createCoodev } from '@coodev/core'
import { CoodevReactPlugin } from './plugin'
import { CoodevReactRenderer } from './renderer'

export type CoodevOptions = Omit<Coodev.CoodevOptions, 'renderer'>

export function coodev(options: CoodevOptions): Coodev.Coodev {
  const plugins: Coodev.Plugin[] = [new CoodevReactPlugin()]
  if (options.plugins) {
    plugins.push(...options.plugins)
  }

  return createCoodev({
    ...options,
    plugins,
    renderer: new CoodevReactRenderer(),
  })
}
