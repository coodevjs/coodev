import type { Coodev, CoodevOptions } from '@coodev/core'

export type CoodevOptions = Omit<CoodevOptions, 'renderer'>

export function coodev(options: CoodevOptions): Coodev
