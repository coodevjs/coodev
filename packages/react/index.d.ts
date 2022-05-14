/// <reference path="coodev-react.d.ts" />

export type CoodevOptions = Omit<Coodev.CoodevOptions, 'renderer'>

export function coodev(options: CoodevOptions): Coodev.Coodev
