import { createCoodev } from '@coodev/core'
import type { Coodev, CoodevOptions, PluginConfiguration } from '@coodev/core'
import { coodevReactPlugin } from './plugin'
import { CoodevReactRenderer } from './renderer'

export type CoodevReactOptions = Omit<CoodevOptions, 'renderer'>

export function coodev(options: CoodevReactOptions): Coodev {
  const plugins: PluginConfiguration[] = [coodevReactPlugin()]
  if (options.plugins) {
    plugins.push(...options.plugins)
  }

  return createCoodev({
    ...options,
    plugins,
    renderer: new CoodevReactRenderer(),
  })
}
