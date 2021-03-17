import { ready } from '@mizchi/worker-dom/dist/lib/worker'

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
    if (node.nodeType === Node.ELEMENT_NODE && 'attributes' in node) {
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
ready.then(() => {
  // console.log('hello worker dom!', document.body)
  document.body.appendChild(
    createElement('The world', `container-${++counter}`)
  )
  walkElement(document.body)
})

self.addEventListener('message', e => {
  // document.body.appendChild(
  //   createElement('The world', `container-${++counter}`)
  // )
  // console.log('hello worker dom!', document.querySelector('#container-2'))
  // walkElement(document.body)

  // @ts-ignore
  self.postMessage(e.data)
})

export function foo(a: string): string {
  return 'hello'
}
