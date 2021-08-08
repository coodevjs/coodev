import type { IRailingConfig, IWebpackChainConfig } from '@railing/types'
import type { ICreateWebpackConfigOptions } from './src/types'

export function createWebpackChainConfig(
  railingConfig: IRailingConfig,
  options: ICreateWebpackConfigOptions
): IWebpackChainConfig