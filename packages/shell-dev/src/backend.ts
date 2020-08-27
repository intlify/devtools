import { createBridge } from '@intlify-devtools/shared'

const brdige = createBridge({
  listen(fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send(data) {
    console.log('backend -> devtools', data)
    window.parent.postMessage(data, '*')
  }
})

console.log('load backend!', brdige)
