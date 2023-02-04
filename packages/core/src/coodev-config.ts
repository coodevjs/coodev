import { COODEV_CONFIG } from './constants'
import * as fs from 'fs'
import * as path from 'path'

const validExtensions = ['.js']

function normalizePublicPath(publicPath: string | undefined): string {
  if (!publicPath) {
    return '/'
  }
  if (publicPath.endsWith('/')) {
    return publicPath
  }
  console.warn('"publicPath" option should end with a slash')
  return publicPath + '/'
}

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
    root,
    publicPath: normalizePublicPath(coodevConfig.publicPath),
    outputDir: coodevConfig.outputDir ?? path.join(root, 'dist'),
    ssr: coodevConfig.ssr ?? true,
    plugins: coodevConfig.plugins ?? [],
    server: {
      port: coodevConfig.server?.port ?? 3000,
    },
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
    console.log(`> Loading coodev config from \`${configPath}\``)
    const userCoodevConfig = require(configPath)

    return normalizeCoodevConfig({
      ...inlineCoodevConfig,
      ...userCoodevConfig,
      plugins: [
        ...(inlineCoodevConfig.plugins || []),
        ...(userCoodevConfig.plugins || []),
      ],
    })
  }

  return normalizeCoodevConfig(inlineCoodevConfig)
}
