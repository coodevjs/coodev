import { CODELL_CONFIG } from '../constants'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

function normalizeCodellConfig(
  codellConfig: Codell.Configuration
): Codell.InternalConfiguration {
  return {
    dev: codellConfig.dev ?? process.env.NODE_ENV !== 'production',
    rootDir: process.cwd(),
    outputDir: codellConfig.outputDir ?? 'build',
    ssr: codellConfig.ssr ?? true,
    runtimeConfig: codellConfig.runtimeConfig ?? {},
    plugins: codellConfig.plugins ?? [],
  }
}

export function loadCodellConfig() {
  const rootDir = process.cwd()

  let codellConfig: Codell.Configuration = {}

  const configPath = path.format({
    dir: rootDir,
    name: CODELL_CONFIG,
    ext: validExtensions[0],
  })

  if (fs.existsSync(configPath)) {
    codellConfig = require(configPath)
  }

  return normalizeCodellConfig(codellConfig)
}
