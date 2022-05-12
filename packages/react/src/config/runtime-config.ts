import coodevConfig from '__COODEV__/config'

export function getRuntimeConfig(): Coodev.RuntimeConfig {
  return coodevConfig.runtimeConfig || {}
}
