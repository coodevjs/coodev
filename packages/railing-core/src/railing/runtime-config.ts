import { IRailingConfig, IRuntimeConfig } from '@railing/types'
import { IS_SERVER } from '../constants'
import { getClientGlobalData } from './gloabl-data'

let runtimeConfig: IRailingConfig | null = null

export function setRuntimeConfig(newRuntimeConfig: IRuntimeConfig) {
  runtimeConfig = newRuntimeConfig
}

export function getRuntimeConfig(): IRuntimeConfig {
  if (IS_SERVER) {
    return runtimeConfig || {}
  }
  if (!runtimeConfig) {
    runtimeConfig = getClientGlobalData().runtimeConfig
  }
  return runtimeConfig
}
