// import { browser } from 'webextension-polyfill-ts'
// import { createEndpoint, forward } from 'comlink-extension'
import * as Comlink from 'comlink'
// import * as BService from './BService'
import { BService } from './BService'
import { mod } from './FService'

console.log('load backend!', window)

function callback(msg: string): string {
  console.log('add callback', msg, window)
  return msg
}

;(async () => {
  const bridge = Comlink.wrap<BService>(Comlink.windowEndpoint(window))
  console.log('bridge ', bridge)
  await bridge.send('heheheheh')
  const callbackProxy = Comlink.proxy(callback)
  console.log('add', await bridge.add(1, 3, callbackProxy), bridge, window)
  setInterval(async () => {
    await bridge.add(1, new Date().getTime(), callbackProxy)
  }, 3000)
  await bridge.registerDevtools(Comlink.proxy(mod))
})()

// browser.runtime.connect()
// Wrap a chrome.runtime.Port
// Comlink.expose(BService, Comlink.windowEndpoint(window))
// obj.test('backend (content)')

/*
function sendListening(): void {
  console.log('sendListening payload ...')
  window.postMessage(
    {
      source: 'intlify-devtools-backend-injection',
      payload: 'listening'
    },
    '*'
  )
}

window.addEventListener('message', (e: MessageEvent) => {
  console.log('recive message event', e)
})

console.log('initial sending')
sendListening()
*/
