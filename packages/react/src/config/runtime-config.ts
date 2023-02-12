import coodevConfig from '__COODEV__/react/config'
import type { RuntimeConfig } from '../types'

export function getRuntimeConfig(): RuntimeConfig {
  return coodevConfig.runtimeConfig || {}
}
