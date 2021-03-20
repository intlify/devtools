import { ready, exportFunctions } from '@intlify/worker-dom/dist/lib/worker'
import type { MetaInfo } from './types'

let _metaInfo: MetaInfo | null = null

const exportingFunctions = {
  getIntlifyMetaInfo: async(): Promise<MetaInfo>  => {
    if (_metaInfo != null) {
      return _metaInfo
    }
    _metaInfo = []
    walkElement(document.body, _metaInfo)
    return _metaInfo
  }
}

exportFunctions(exportingFunctions)

function getIntlifyMetaData(attributes: Attr[]): string {
  const attr = attributes.find(({ name }) => name === 'data-intlify')
  return attr ? attr.value : ''
}

function walkElement(node: Node, metaInfo: MetaInfo) {
  node.childNodes.forEach(node => {
    // console.log('id, __INTLIFY__META__', (node as HTMLElement).id, (node as any).attributes, node)
    if (node.nodeType === 1 && 'attributes' in node) {
      const element = (node as unknown) as Element
      const value = getIntlifyMetaData(
        (element.attributes as unknown) as Attr[]
      )
      value && metaInfo.push(value)
    }
    walkElement(node, metaInfo)
  })
}

;(async () => {
  await ready
  _metaInfo = []
  await walkElement(document.body, _metaInfo)
})()
