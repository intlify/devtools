import { ready, exportFunctions } from '@intlify/worker-dom/dist/lib/worker'
import type { MetaInfo } from './types'

let _metaInfo: MetaInfo | null = null

let _resolve: Function | null = null // eslint-disable-line @typescript-eslint/ban-types
const _ready = new Promise(resolve => {
  _resolve = resolve
})

async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const exportingFunctions = {
  async ready(): Promise<void> {
    await _ready
  },
  async getIntlifyMetaInfo(): Promise<MetaInfo> {
    if (_metaInfo != null) {
      return _metaInfo
    }
    _metaInfo = []
    walkElements(document.body, _metaInfo, [])
    return _metaInfo
  },
  async pushMeta(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return (
      await fetch(endpoint, {
        method: 'post',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    ).json()
  },
  async walkElements(url?: string): Promise<{ url?: string; meta: MetaInfo, text?: string[] }> {
    const metaInfo: MetaInfo = []
    const text: string[] = []
    walkElements(document.body, metaInfo, text)
    _metaInfo = metaInfo
    return { url, meta: metaInfo, text }
  }
}

exportFunctions(exportingFunctions)

function getIntlifyMetaData(attributes: Attr[]): string {
  const attr = attributes.find(({ name }) => name === 'data-intlify')
  return attr ? attr.value : ''
}

function hasCharacters(target: string): boolean {
  return !!target.replace(/[\s\t\r\n]+/g, '').length
}

function walkElements(node: Node, metaInfo: MetaInfo, text: string[]) {
  // console.log('id, __INTLIFY__META__', node.nodeName, node.__INTLIFY_META__)
  const { __INTLIFY_META__ } = (node as any)
  __INTLIFY_META__ && metaInfo.push(__INTLIFY_META__)
  node.childNodes.forEach((node: Node) => {
    // console.log('worker enum', node.nodeType, node.textContent, hasCharacters(node.textContent!))
    node.nodeType === 3 && node.textContent && hasCharacters(node.textContent) && text.push(node.textContent)
    walkElements(node, metaInfo, text)
  })
}

;(async () => {
  await ready
  _metaInfo = []
  // TODO:
  // await delay(3000)
  // console.log('... worker dom initialized !!')
  // @ts-ignore
  _resolve && _resolve()
  // await walkElement(document.body, _metaInfo)
})()
