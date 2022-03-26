import type { Compiler } from 'webpack'

export interface AssetsInfo {
  styles: string[]
  scripts: string[]
}

export interface EntrypointAssetsPluginOptions {
  onAssetsCallback: (info: AssetsInfo) => void
}

export class EntrypointAssetsPlugin {
  constructor(private readonly options: EntrypointAssetsPluginOptions) {}

  public apply(compiler: Compiler) {
    const { onAssetsCallback } = this.options
    compiler.hooks.thisCompilation.tap('railing/compilation', compilation => {
      compilation.hooks.processAssets.tap('railing/process-asset', () => {
        const publicPath = compilation.outputOptions.publicPath as string
        const styles: string[] = []
        const scripts: string[] = []
        const entryNames = Array.from(compilation.entrypoints.keys())
        for (const entryName of entryNames) {
          const files = compilation.entrypoints.get(entryName)?.getFiles()
          if (files) {
            for (const file of files) {
              const assetInfo = compilation.getAsset(file)?.info
              if (
                assetInfo &&
                !assetInfo.hotModuleReplacement &&
                !assetInfo.development
              ) {
                if (/\.css$/.test(file)) {
                  styles.push(publicPath + file)
                } else {
                  scripts.push(publicPath + file)
                }
              }
            }
          }
        }

        onAssetsCallback({
          styles,
          scripts,
        })
      })
    })
  }
}
