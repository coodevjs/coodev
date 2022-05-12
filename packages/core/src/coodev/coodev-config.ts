import { COODEV_CONFIG } from '../constants'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

function normalizeCoodevConfig(
  coodevConfig: Coodev.Configuration,
): Coodev.InternalConfiguration {
  return {
    dev: coodevConfig.dev ?? process.env.NODE_ENV !== 'production',
    rootDir: process.cwd(),
    outputDir: coodevConfig.outputDir ?? 'build',
    ssr: coodevConfig.ssr ?? true,
    runtimeConfig: coodevConfig.runtimeConfig ?? {},
    plugins: coodevConfig.plugins ?? [],
  }
}

export function loadCoodevConfig() {
  const rootDir = process.cwd()

  let coodevConfig: Coodev.Configuration = {}

  const configPath = path.format({
    dir: rootDir,
    name: COODEV_CONFIG,
    ext: validExtensions[0],
  })

  if (fs.existsSync(configPath)) {
    coodevConfig = require(configPath)
  }

  return normalizeCoodevConfig(coodevConfig)
}
