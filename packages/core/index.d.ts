import { IRailing, IGlobalData, IRuntimeConfig } from '@railing/types'

export class Railing implements IRailing {}

export function getClientGlobalData(): IGlobalData

export function setRuntimeConfig(newRuntimeConfig: IRuntimeConfig): void

export function getRuntimeConfig(): IRuntimeConfig

export * from '@railing/types'
