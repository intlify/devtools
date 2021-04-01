import { NodeTypes } from '@vue/compiler-core'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { isObject, isString, isSymbol } from '@intlify/shared'
import { traverseI18nCallExpression } from './babel'

import type {
  Node,
  TemplateChildNode,
  SimpleExpressionNode,
  ElementNode,
  CompoundExpressionNode,
  ExpressionNode,
  DirectiveNode,
  IfNode,
  ForNode,
  RootNode,
  InterpolationNode
} from '@vue/compiler-core'
import type { TraverseI18nOptions } from './babel'

function isRootNode(node: Node): node is RootNode {
  return node.type === NodeTypes.ROOT
}

function isTemplateChildNode(node: Node): node is TemplateChildNode {
  return (
    node.type === NodeTypes.ELEMENT ||
    node.type === NodeTypes.INTERPOLATION ||
    node.type === NodeTypes.COMPOUND_EXPRESSION ||
    node.type === NodeTypes.TEXT ||
    node.type === NodeTypes.COMMENT ||
    node.type === NodeTypes.IF ||
    node.type === NodeTypes.IF_BRANCH ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.TEXT_CALL
  )
}

function isElementNode(node: any): node is ElementNode {
  return isObject(node) && node.type === NodeTypes.ELEMENT
}

function isTemplateExpressionNode(node: any): node is ExpressionNode {
  return (
    isObject(node) &&
    (node.type === NodeTypes.SIMPLE_EXPRESSION ||
      node.type === NodeTypes.COMPOUND_EXPRESSION)
  )
}

function isInterpolationNode(node: any): node is InterpolationNode {
  return isObject(node) && node.type === NodeTypes.INTERPOLATION
}

function isCompoundExpressionNode(node: any): node is CompoundExpressionNode {
  return isObject(node) && node.type === NodeTypes.COMPOUND_EXPRESSION
}

function isSimpleExpressionNode(node: any): node is SimpleExpressionNode {
  return isObject(node) && node.type === NodeTypes.SIMPLE_EXPRESSION
}

function isIfNode(node: any): node is IfNode {
  return isObject(node) && node.type === NodeTypes.IF
}

function isForNode(node: any): node is ForNode {
  return isObject(node) && node.type === NodeTypes.FOR
}

function isDirectiveNode(node: any): node is DirectiveNode {
  return isObject(node) && node.type === NodeTypes.DIRECTIVE
}

type I18nKeyVisitor = (keys: string[]) => void

/**
 * Get i18n resource keys
 *
 * @param source the source code, which is included i18n resource keys
 * @returns the i18n resource keys
 */
export function getResourceKeys(
  source: string,
  options: TraverseI18nOptions = {}
): string[] {
  let keys: string[] = []
  const {
    descriptor: { template, script, scriptSetup }
  } = parse(source)
  const ret = compileTemplate({
    source: template!.content,
    filename: 'template.vue',
    id: 'template.vue' // dummy
  })
  if (ret?.ast) {
    const visitor = (k: string[]): void => {
      keys = [...keys, ...k]
    }
    traverseVueTemplateNode(ret.ast, visitor, options)
  }
  return keys
}

function traverseVueTemplateNode(
  node: Node,
  visitor: I18nKeyVisitor,
  options: TraverseI18nOptions
): void {
  if (isTemplateChildNode(node)) {
    if (isInterpolationNode(node)) {
      // console.log('interpolation node', node.type, node.content, node.loc.source)
      if (isTemplateExpressionNode(node.content)) {
        visitor(traverseI18nCallExpression(node.loc.source, options))
      }
    } else if (isCompoundExpressionNode(node)) {
      // console.log('compound expression node', node.type, node.loc.source)
      node.children.forEach(node => {
        if (!isString(node) && !isSymbol(node)) {
          traverseVueTemplateNode(node, visitor, options) 
        }
      })
    } else if (isIfNode(node)) {
      // console.log('if node', node.type, node, node.loc.source)
      node.branches.forEach(node => {
        // console.log('if branch node', node)
        if (isTemplateExpressionNode(node.condition)) {
          visitor(traverseI18nCallExpression(node.condition.loc.source, options)) 
        }
      })
    } else if (isForNode(node)) {
      // console.log('fore node', node)
      if (isTemplateExpressionNode(node.source)) {
        visitor(traverseI18nCallExpression(node.source.loc.source, options)) 
      }
    } else if (isElementNode(node)) {
      node.children.forEach(node => traverseVueTemplateNode(node, visitor, options))
      node.props.forEach(node => {
        if (isDirectiveNode(node) && isTemplateExpressionNode(node.exp)) {
          visitor(traverseI18nCallExpression(node.exp.loc.source, options))
        }
      })
    }
  } else if (isSimpleExpressionNode(node)) {
    // console.log('simple expression node', node)
    visitor(traverseI18nCallExpression(node.loc.source, options))
  } else if (isRootNode(node)) {
    node.children.forEach(node => {
      traverseVueTemplateNode(node, visitor, options) 
    })
  }
}
