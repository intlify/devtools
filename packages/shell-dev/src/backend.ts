import { createBridge } from '@intlify-devtools/shared'
import { setupBackend } from '@intlify-devtools/app-backend'
import * as Comlink from 'comlink'
import * as BService from './BService'

const bridge = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  add(a: number, b: number, cb: Function): number {
    console.log('call add', a, b, window)
    cb('backend!')
    return a + b
  },
  send(msg: string): void {
    console.log('send', msg)
  }
}

Comlink.expose(BService, Comlink.windowEndpoint(window.parent))

console.log('call highlight ...')
BService.highlight(1111)
console.log('... done')
/*
const brdige = createBridge({
  listen(fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send(data) {
    console.log('backend -> devtools', data)
    window.parent.postMessage(data, '*')
  }
})
*/

setupBackend(bridge)
console.log('load backend!', bridge)
