import codellConfig from '__CODELL__/config'

export function getRuntimeConfig(): Codell.RuntimeConfig {
  return codellConfig.runtimeConfig || {}
}
