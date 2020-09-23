/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/proxy.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser } from 'webextension-polyfill-ts'

console.log('[proxy] load proxy!', window)

// @ts-ignore
const port = browser.runtime.connect({
  name: 'content-script'
})

port.onMessage.addListener(sendMessageToBackend)
window.addEventListener('message', sendMessageToDevtools)
port.onDisconnect.addListener(handleDisconnect)

sendMessageToBackend('init')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendMessageToBackend(payload: string): void {
  window.postMessage(
    {
      source: 'intlify-devtools-proxy',
      payload
    },
    '*'
  )
}

function sendMessageToDevtools(e: MessageEvent): void {
  if (e.data && e.data?.source === 'intlify-devtools-backend') {
    port.postMessage(e.data?.payload)
  } else if (
    e.data &&
    e.data?.source === 'intlify-devtools-backend-injection'
  ) {
    if (e.data.payload === 'listening') {
      sendMessageToBackend('init')
    }
  }
}

function handleDisconnect(): void {
  window.removeEventListener('message', sendMessageToDevtools)
  sendMessageToBackend('shutdown')
}
