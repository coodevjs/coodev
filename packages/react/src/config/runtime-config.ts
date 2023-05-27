import coodevConfig from '__COODEV__/react/config'
import { getGlobalData } from './global-data'
import type { RuntimeConfig } from '../types'

export function getRuntimeConfig(): RuntimeConfig {
  if (!coodevConfig.ssr) {
    return coodevConfig.runtimeConfig || {}
  }

  const isServer = typeof window === 'undefined'
  if (isServer) {
    // @ts-ignore
    const { runtimeConfig } = globalThis.__COODEV__.coodevConfig

    return runtimeConfig || {}
  }

  return getGlobalData().runtimeConfig
}
