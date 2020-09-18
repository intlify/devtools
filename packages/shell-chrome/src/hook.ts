import { browser } from 'webextension-polyfill-ts'
import * as Comlink from 'comlink'
// import { createEndpoint, forward } from 'comlink-extension'
import { forward, createEndpoint } from './comlink-ext'
import * as BService from './BService'
import { mod } from './FService'

console.log('load hook!', window)

// Wrap a chrome.runtime.Port
// const obj = Comlink.wrap(createEndpoint(browser.runtime.connect())) as any
// obj.test('detector (popup)')

// const { port1, port2 } = new MessageChannel()
// forward(port1, browser.runtime.connect())
// Comlink.expose(BService, createEndpoint(browser.runtime.connect()))
//
// console.log('call highlight ...')
// BService.highlight(1111)
// console.log('... done')

// Wrap a chrome.runtime.Port
if (document instanceof HTMLDocument) {
  const source = 'window.__INTLIFY__ = true;'
  const script = document.createElement('script')
  script.textContent = source
  document.documentElement.appendChild(script)
  script?.parentNode.removeChild(script)
}

window.addEventListener('message', onMessage)

function onMessage(ev: MessageEvent) {
  console.log('[hook] on message', ev)
  if (
    ev.data?.source === 'intlify-devtools-handshake' &&
    ev.data?.payload === 'boot'
  ) {
    const { port1, port2 } = new MessageChannel()
    const fn = (e: MessageEvent) => {
      window.removeEventListener('message', onMessage)
      console.log('[hook] port on message', e)
      if (e.data?.payload === 'start') {
        // Comlink.expose(mod, port2)
        forward(
          port2,
          browser.runtime.connect({ name: 'intlify-devtools-content' })
        )
        port2.postMessage({ payload: 'expose' })
      } else {
        port2.removeEventListener('message', fn)
      }
    }
    port2.addEventListener('message', fn)
    port2.start()
    window.postMessage(
      { source: 'intlify-devtools-handshake', payload: 'connect' },
      '*',
      [port1]
    )
  }
}

/*
const port = browser.runtime.connect()

port.onMessage.addListener(sendMessageToBackend)
window.addEventListener('message', sendMessageToBackend)
port.onDisconnect.addListener(handleDisconnect)

function sendMessageToBackend(payload: any) {
  console.log('sendMessageToBackend', payload)
  // window.postMessage(payload, '*')
}

function sendMessageToDevtools(ev: MessageEvent) {
  console.log('sendMessageToDevtools', ev)
  port.postMessage(ev.data)
}

function handleDisconnect() {
  window.removeEventListener('message', sendMessageToDevtools)
}
*/

// setInterval(() => {
//   BService.highlight(1111, 'hook')
// }, 3000)
//
/*
// TODO: should be implemented payload typingsa ...
function sendMessageToBackend(payload: unknown) {
  console.log('sendMessageToBackend: ', payload)
  window.postMessage(
    {
      source: 'intlify-devtools-proxy',
      payload: payload
    },
    '*'
  )
}

function sendMessageToDevtools(e: MessageEvent) {
  console.log('sendMessageToDevtools: ', e)
  if (e.data && e.data.source === 'intlify-devtools-backend') {
    port.postMessage(e.data.payload)
  } else if (e.data && e.data.source === 'intlify-devtools-backend-injection') {
    if (e.data.payload === 'listening') {
      sendMessageToBackend('init')
    }
  }
}

function handleDisconnect() {
  console.log('handle Disconnect')
  window.removeEventListener('message', sendMessageToDevtools)
  sendMessageToBackend('shutdown')
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore NOTE: webextension-polyfill-ts unmatch typing ...
const port = browser.runtime.connect({ name: 'content-script' })
port.onMessage.addListener(sendMessageToBackend)
window.addEventListener('message', sendMessageToDevtools)
port.onDisconnect.addListener(handleDisconnect)
*/
