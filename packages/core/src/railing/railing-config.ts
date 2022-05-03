import { RAILING_CONFIG } from '../constants'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

function normalizeRailingConfig(
  railingConfig: Railing.Configuration,
): Railing.InternalConfiguration {
  return {
    dev: railingConfig.dev ?? process.env.NODE_ENV !== 'production',
    rootDir: process.cwd(),
    outputDir: railingConfig.outputDir ?? 'build',
    ssr: railingConfig.ssr ?? true,
    runtimeConfig: railingConfig.runtimeConfig ?? {},
    plugins: railingConfig.plugins ?? [],
  }
}

export function loadRailingConfig() {
  const rootDir = process.cwd()

  let railingConfig: Railing.Configuration = {}

  const configPath = path.format({
    dir: rootDir,
    name: RAILING_CONFIG,
    ext: validExtensions[0],
  })

  if (fs.existsSync(configPath)) {
    railingConfig = require(configPath)
  }

  return normalizeRailingConfig(railingConfig)
}
