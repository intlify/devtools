import { parse } from '@babel/parser'
import traverse, { NodePath } from '@babel/traverse'
import { isArray } from '@intlify/shared'

import {
  isIdentifier,
  isStringLiteral,
  isTemplateLiteral,
  isThisExpression,
  isMemberExpression,
  Identifier,
  StringLiteral,
  Node
} from '@babel/types'

export type I18nCallIdentifier = string
export type I18nObjectIdentifier = string

export const DEFAULT_I18N_CALL_IDENTIFITERS = ['t', '$t', 'tc', '$tc']
export const DEFAULT_I18N_OBJECT_IDENTIFITERS = ['this']

export interface TraverseI18nOptions {
  callIdentifiers?: I18nCallIdentifier[]
  objectIdentifiers?: I18nObjectIdentifier[]
}

function traverseCallableExpression(
  expression: Identifier | StringLiteral,
  argument: NodePath<Node>,
  keys: string[],
  callIdentifiers: I18nCallIdentifier[]
): void {
  if (
    callIdentifiers.some(
      id =>
        isIdentifier(expression, { name: id }) ||
        isStringLiteral(expression, { value: id })
    )
  ) {
    if (!isArray(argument)) {
      if (isStringLiteral(argument.node)) {
        keys.push(argument.node.value)
      } else if (
        isTemplateLiteral(argument.node) &&
        argument.node.expressions.length === 0
      ) {
        // static only
        keys.push(argument.node.quasis[0].value.raw)
      }
    }
  }
}

export function traverseI18nCallExpression(
  source: string,
  options: TraverseI18nOptions = {}
): string[] {
  const callIdentifiers =
    options.callIdentifiers ?? DEFAULT_I18N_CALL_IDENTIFITERS
  const objectIdentifiers =
    options.objectIdentifiers ?? DEFAULT_I18N_OBJECT_IDENTIFITERS

  const ast = parse(source, {
    sourceType: 'module',
    plugins: [
      'topLevelAwait',
      'jsx', // for vue-jsx
      'typescript',
      'decorators-legacy' // for vue-class-component
    ]
  })

  const keys = [] as string[]
  traverse(ast, {
    CallExpression(path) {
      const keyArgument = path.get('arguments.0')
      if (isArray(keyArgument)) {
        return
      }

      if (isIdentifier(path.node.callee)) {
        traverseCallableExpression(
          path.node.callee,
          keyArgument,
          keys,
          callIdentifiers
        )
      } else if (isMemberExpression(path.node.callee)) {
        const member = path.node.callee
        const { property, object } = member
        if (
          (objectIdentifiers.includes('this') && isThisExpression(object)) ||
          objectIdentifiers.some(id => isIdentifier(object, { name: id }))
        ) {
          if (isIdentifier(property) || isStringLiteral(property)) {
            traverseCallableExpression(
              property,
              keyArgument,
              keys,
              callIdentifiers
            )
          }
        }
      }
    }
  })
  return keys
}
