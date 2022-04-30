import type { CallExpression } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import type { IRailingReactRouteConfig } from '../types'
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
        { opts }: { opts: PluginOptions },
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
            const content = opts.routes.map(route => {
              return `
                { 
                  path: '${route.path}', 
                  component: require('${route.component}').default 
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
