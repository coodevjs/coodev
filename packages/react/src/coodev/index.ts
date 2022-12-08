import { createCoodev } from '@coodev/core'
import { coodevReactPlugin } from './plugin'
import { CoodevReactRenderer } from './renderer'

export type CoodevOptions = Omit<Coodev.CoodevOptions, 'renderer'>

export function coodev(options: CoodevOptions): Coodev.Coodev {
  const plugins: Coodev.PluginConfiguration[] = [coodevReactPlugin()]
  if (options.plugins) {
    plugins.push(...options.plugins)
  }

  return createCoodev({
    ...options,
    plugins,
    renderer: new CoodevReactRenderer(),
  })
}
