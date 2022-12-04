import { COODEV_CONFIG } from './constants'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

function normalizeCoodevConfig(
  coodevConfig: Coodev.Configuration,
): Coodev.InternalConfiguration {
  const rootDir = process.cwd()
  let root = rootDir
  if (coodevConfig.root) {
    if (path.isAbsolute(coodevConfig.root)) {
      root = coodevConfig.root
    } else {
      root = path.resolve(rootDir, coodevConfig.root)
    }
  }
  return {
    ...coodevConfig,
    dev: coodevConfig.dev ?? process.env.NODE_ENV !== 'production',
    rootDir,
    root,
    outputDir: coodevConfig.outputDir ?? path.join(root, 'dist'),
    ssr: coodevConfig.ssr ?? true,
    plugins: coodevConfig.plugins ?? [],
  }
}

export function loadCoodevConfig(inlineCoodevConfig: Coodev.Configuration) {
  const rootDir = process.cwd()

  const configPath = path.format({
    dir: rootDir,
    name: COODEV_CONFIG,
    ext: validExtensions[0],
  })

  if (fs.existsSync(configPath)) {
    // TODO merge config
    const userCoodevConfig = require(configPath)

    return normalizeCoodevConfig({
      ...inlineCoodevConfig,
      ...userCoodevConfig,
      plugins: [
        ...(inlineCoodevConfig.plugins || []),
        ...userCoodevConfig.plugins,
      ],
    })
  }

  return normalizeCoodevConfig(inlineCoodevConfig)
}
