// import { browser } from 'webextension-polyfill-ts'
// import { createEndpoint, forward } from 'comlink-extension'
import * as Comlink from 'comlink'
// import * as BService from './BService'
import { mod } from './BService'
import { Devtools } from './FService'

console.log('load backend!', window)

function callback(msg: string): string {
  console.log('[backend] in callback', msg, window)
  return msg
}

/*
;(async () => {
  const bridge = Comlink.wrap<BService>(Comlink.windowEndpoint(window))
  console.log('[backend] bridge ', bridge)
  await bridge.send('heheheheh')
  const callbackProxy = Comlink.proxy(callback)
  console.log('[backend] add', await bridge.add(1, 3, callbackProxy), bridge, window)
  setInterval(async () => {
    await bridge.add(1, new Date().getTime(), callbackProxy)
  }, 10000)
  await bridge.registerDevtools(Comlink.proxy(mod))
})()
*/

window.addEventListener('message', handshake)

function sendBooting() {
  window.postMessage(
    { source: 'intlify-devtools-handshake', payload: 'boot' },
    '*'
  )
}
sendBooting()

async function handshake(e: MessageEvent) {
  console.log('[backend] handshake', e)
  if (
    e.data?.source === 'intlify-devtools-handshake' &&
    e.data?.payload === 'connect'
  ) {
    const contentPort = e.ports[0]
    if (contentPort) {
      window.removeEventListener('message', handshake)
      contentPort.start()
      const fn = async (e: MessageEvent) => {
        if (e.data?.payload === 'expose') {
          const fend = Comlink.wrap<Devtools>(contentPort)
          console.log('[backend] fend', fend)
          await fend.setBackend(Comlink.proxy(mod))
          console.log(
            `[backend] expand ${await fend.expand(1, Comlink.proxy(callback))}`
          )
          contentPort.postMessage({ payload: 'done' })
          contentPort.removeEventListener('message', fn)
        }
      }
      contentPort.addEventListener('message', fn)
      contentPort.postMessage({ payload: 'start' })
    }
  } else {
    sendBooting()
  }
}

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
