/**
 * Hook module on chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/hook.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser } from 'webextension-polyfill-ts'

console.log('load hook!', window)

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
