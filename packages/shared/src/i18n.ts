import { CompoundExpressionNode, ExpressionNode, InterpolationNode } from '@vue/compiler-core'
import { parse } from '@vue/compiler-sfc'

import { Node, TemplateChildNode, NodeTypes, SimpleExpressionNode } from '@vue/compiler-core'

function isTemplateChildNode(node: Node): node is TemplateChildNode {
  return node.type === NodeTypes.ELEMENT || 
    node.type === NodeTypes.INTERPOLATION ||
    node.type === NodeTypes.COMPOUND_EXPRESSION ||
    node.type === NodeTypes.TEXT ||
    node.type === NodeTypes.COMMENT ||
    node.type === NodeTypes.IF ||
    node.type === NodeTypes.IF_BRANCH ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.TEXT_CALL
}

function isTemplateExpressionNode(node: any): node is ExpressionNode {
  return node != null && (node.type === NodeTypes.SIMPLE_EXPRESSION ||
    node.type === NodeTypes.COMPOUND_EXPRESSION)
}

function isInterpolationNode(node: any): node is InterpolationNode {
  return node != null && node.type === NodeTypes.INTERPOLATION
}

function isCompoundExpressionNode(node: any): node is CompoundExpressionNode {
  return node != null && node.type === NodeTypes.COMPOUND_EXPRESSION
}

function isSimpleExpressionNode(node: Node): node is SimpleExpressionNode {
  return node.type === NodeTypes.SIMPLE_EXPRESSION
  
}

/**
 * Get i18n resource keys
 *
 * @param source the source code, which is included i18n resource keys
 * @returns the i18n resource keys
 */
export function getResourceKeys(source: string): string[] {
  // const { template, script, scriptSetup } = parse(source)
  const keys: string[] = []
  const { descriptor: { template, script, scriptSetup } } = parse(source)
  if (template?.ast) {
    walkVueTemplateNode(template.ast, keys)
  }
  console.log('ret', template?.ast)
  return []
}

function walkCompoundExpressionNode(node: Node, keys: string[]): void {
}

function walkVueTemplateNode(node: Node, keys: string[]): void {
  if (isTemplateChildNode(node)) {
    if (isInterpolationNode(node)) {
      if (isCompoundExpressionNode(node.content)) {
        node.content.children.forEach(node => {
          if (isInterpolationNode(node) || isTemplateExpressionNode(node)) {
            walkVueTemplateNode(node, keys)
          }
        })
      } else {
        walkVueTemplateNode(node, keys)
      }
    } else if (isCompoundExpressionNode(node)) {
      node.children.forEach(node => {
        if (isInterpolationNode(node) || isTemplateExpressionNode(node)) {
          walkVueTemplateNode(node, keys)
        }
      }) 
    }
  } else if (isSimpleExpressionNode(node)) {
    // TODO:
    keys.push(node.content)
  }
}