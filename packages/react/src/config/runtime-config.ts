import coodevConfig from '__COODEV__/react/config'

export function getRuntimeConfig(): Coodev.RuntimeConfig {
  return coodevConfig.runtimeConfig || {}
}
