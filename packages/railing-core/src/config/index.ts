import { RAILING_CONFIG } from '../constants'
import { IRailingConfig } from '@railing/types'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

export function loadRailingConfig() {
  const rootDir = process.cwd()

  let railingConfig: IRailingConfig = {}

  const configPath = path.format({
    dir: rootDir,
    name: RAILING_CONFIG,
    ext: validExtensions[0]
  })

  if (fs.existsSync(configPath)) {
    railingConfig = require(configPath)
  }

  return railingConfig
}