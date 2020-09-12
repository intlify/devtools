import { browser } from 'webextension-polyfill-ts'
import * as Comlink from 'comlink'
import { createEndpoint, forward } from 'comlink-extension'
import * as BService from './BService'

console.log('load hook!', window)

// Wrap a chrome.runtime.Port
// const obj = Comlink.wrap(createEndpoint(browser.runtime.connect())) as any
// obj.test('detector (popup)')

const { port1, port2 } = new MessageChannel()
forward(port1, browser.runtime.connect())
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

// setInterval(() => {
//   BService.highlight(1111)
// }, 3000)

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
