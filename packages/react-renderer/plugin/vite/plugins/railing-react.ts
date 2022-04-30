import { Plugin } from 'vite'
import type { IRailingConfig } from '@railing/types'

const railingVirtualModuleIds = [
  '__RAILING__/config',
  '__RAILING__/react/routes',
]

export interface IRailingReactRouteConfig {
  path: string
  component: string
}

export interface IViteRailingReactPluginOptions {
  railingConfig: IRailingConfig
  routes: IRailingReactRouteConfig[]
}

export function railingReactPlugin(
  opts: IViteRailingReactPluginOptions,
): Plugin {
  return {
    name: 'railing-react',
    resolveId(id) {
      if (railingVirtualModuleIds.includes(id)) {
        return id
      }
      return null
    },
    load(id) {
      if ('__RAILING__/react/routes' === id) {
        // const content = opts.routes.map(route => {
        //   return `
        //     {
        //       path: '${route.path}',
        //       // component: require('${route.component}').default
        //       component: null
        //     }
        //   `
        // })

        // return `export default [${content.join(',')}]`
        return 'export default []'
      }
      if ('__RAILING__/config' === id) {
        // console.log(opts.railingConfig)

        // // console.log(`export default ${JSON.stringify(opts.railingConfig)}`)

        return `export default ${JSON.stringify(opts.railingConfig)}`
      }
      return null
    },
  }
}
