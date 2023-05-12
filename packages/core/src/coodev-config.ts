import * as fs from 'fs'
import * as path from 'path'
import { COODEV_CONFIG } from './constants'
import type { Configuration, InternalConfiguration } from './types'

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
  coodevConfig: Configuration,
): InternalConfiguration {
  const rootDir = process.cwd()
  let root = rootDir
  if (coodevConfig.root) {
    if (path.isAbsolute(coodevConfig.root)) {
      root = coodevConfig.root
    } else {
      root = path.resolve(rootDir, coodevConfig.root)
    }
  }

  let srcDir = rootDir
  if (coodevConfig.srcDir) {
    if (path.isAbsolute(coodevConfig.srcDir)) {
      srcDir = coodevConfig.srcDir
    } else {
      srcDir = path.resolve(rootDir, coodevConfig.srcDir)
    }
  }

  let outputDir = coodevConfig.outputDir
  if (outputDir) {
    if (!path.isAbsolute(outputDir)) {
      outputDir = path.resolve(rootDir, outputDir)
    }
  } else {
    outputDir = path.join(root, 'dist')
  }

  const serverConfig = coodevConfig.server ?? {}
  return {
    ...coodevConfig,
    dev: coodevConfig.dev ?? process.env.NODE_ENV !== 'production',
    root,
    srcDir,
    publicPath: normalizePublicPath(coodevConfig.publicPath),
    outputDir,
    ssr: coodevConfig.ssr ?? true,
    plugins: coodevConfig.plugins ?? [],
    server: {
      host: serverConfig.host ?? '0.0.0.0',
      port: serverConfig.port ?? 3000,
    },
  }
}

export function loadCoodevConfig(inlineCoodevConfig: Configuration) {
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
      server: {
        ...inlineCoodevConfig.server,
        ...userCoodevConfig.server,
      },
      plugins: [
        ...(inlineCoodevConfig.plugins || []),
        ...(userCoodevConfig.plugins || []),
      ],
    })
  }

  return normalizeCoodevConfig(inlineCoodevConfig)
}
