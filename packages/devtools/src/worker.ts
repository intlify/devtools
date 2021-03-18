import { ready, exportFunction } from '@intlify/worker-dom/dist/lib/worker'

async function foo(a: string): Promise<string> {
  return 'hello'
}

[foo].map(fn => exportFunction(fn.name, fn))

function createElement(msg: string, id: string): HTMLDivElement {
  const el = document.createElement('div')
  el.id = id
  el.textContent = msg
  return el
}

function getIntlifyMetaData(attributes: Attr[]): string {
  const attr = attributes.find(({ name }) => name === 'data-intlify')
  return attr ? attr.value : ''
}

function walkElement(node: Node) {
  node.childNodes.forEach(node => {
    // console.log('id, __INTLIFY__META__', (node as HTMLElement).id, (node as any).attributes, node)
    if (node.nodeType === 1 && 'attributes' in node) {
      const element = (node as unknown) as Element
      const value = getIntlifyMetaData(
        (element.attributes as unknown) as Attr[]
      )
      console.log(value)
    }
    walkElement(node)
  })
}

let counter = 1

;(async () => {
  await ready

  // console.log('hello worker dom!', document.body)
  document.body.appendChild(createElement('The world', `container-${++counter}`))
  walkElement(document.body)
})()