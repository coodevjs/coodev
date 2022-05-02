import { IRuntimeConfig } from '@railing/types'
import railingConfig from '__RAILING__/config'

export function getRuntimeConfig(): IRuntimeConfig {
  return railingConfig.runtimeConfig || {}
}
