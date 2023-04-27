#!/usr/bin/env node --es-module-specifier-resolution=node
import { cac } from 'cac'
import { start, CoodevStartOptions } from './start'
import { build } from './build'

const cli = cac('coodev')

cli.command('build', 'Build a production bundle').action(() => {
  build()
})

cli
  .command('start', 'Start a production server')
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .action((options: CoodevStartOptions) => {
    start({
      ...options,
      dev: false,
    })
  })

cli
  .command('[root]', 'Start dev server') // default command
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .action((root: string, options: CoodevStartOptions) => {
    start({
      ...options,
      root,
      dev: true,
    })
  })

cli.parse()
