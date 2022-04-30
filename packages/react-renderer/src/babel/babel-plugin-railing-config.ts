import type { CallExpression } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import type { IRailingConfig } from 'packages/types'
import * as parser from '@babel/parser'

interface PluginOptions {
  railingConfig: IRailingConfig
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
            argument.value === '__RAILING__/config'
          ) {
            const stringified = JSON.stringify(opts.railingConfig)
            // 用 () 包裹，没有 () 会被认为是一个 block，不是对象
            const updatedAst = parser.parse(`(${stringified})`)
            nodePath.replaceWithMultiple(updatedAst.program.body)
          }
        }
      },
    },
  }
}
