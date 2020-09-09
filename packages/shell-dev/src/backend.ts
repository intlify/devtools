import { createBridge } from '@intlify-devtools/shared'
import { setupBackend } from '@intlify-devtools/app-backend'

const brdige = createBridge({
  listen(fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send(data) {
    console.log('backend -> devtools', data)
    window.parent.postMessage(data, '*')
  }
})

setupBackend(brdige)
console.log('load backend!', brdige)
