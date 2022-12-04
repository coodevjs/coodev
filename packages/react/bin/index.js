#!/usr/bin/env node

const command = process.argv[2]

switch (command) {
  case 'build':
    require('./build')
    break
  case 'start':
    require('./start')
    break
  case 'dev':
    require('./dev')
    break
  default:
    console.log('Unknown command: ' + command)
    break
}
