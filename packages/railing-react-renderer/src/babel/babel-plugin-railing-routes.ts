import type { CallExpression } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import type { IRailingReactRouteConfig } from '../types'
import * as path from 'path'
import * as parser from '@babel/parser'

interface PluginOptions {
  rootDir: string
  routes: IRailingReactRouteConfig[]
}

export default function () {
  return {
    visitor: {
      CallExpression(
        nodePath: NodePath<CallExpression>,
        state: { opts: PluginOptions },
      ) {
        if (
          'name' in nodePath.node.callee &&
          nodePath.node.callee.name === 'require'
        ) {
          const argument = nodePath.node.arguments[0]
          if (
            argument.type === 'StringLiteral' &&
            argument.value === '__RAILING__/react/routes'
          ) {
            const rootDir = state.opts.rootDir
            const content = state.opts.routes.map(route => {
              const fullPath = path.join(rootDir, route.component)
              const componentPath = fullPath.replace(/\\/, '/')
              return `
                { 
                  path: '${route.path}', 
                  component: require('${componentPath}').default 
                }
              `
            })
            const updatedAst = parser.parse(`[${content.join(',')}]`, {
              sourceType: 'module',
            })
            nodePath.replaceWithMultiple(updatedAst.program.body)
          }
        }
      },
    },
  }
}
