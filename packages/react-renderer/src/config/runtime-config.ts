import railingConfig from '__RAILING__/config'

export function getRuntimeConfig(): Railing.RuntimeConfig {
  return railingConfig.runtimeConfig || {}
}
