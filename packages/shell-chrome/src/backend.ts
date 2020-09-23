/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/backend.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { setupBackend } from '@intlify-devtools/app-backend'
import { createBridge } from '@intlify-devtools/shared'

console.log('[backend] load backend!', window)

window.addEventListener('message', handshake)

function sendListening() {
  window.postMessage(
    {
      source: 'intlify-devtools-backend-injection',
      payload: 'listening'
    },
    '*'
  )
}
sendListening()

function handshake(e: MessageEvent) {
  if (
    e.data?.source === 'intlify-devtools-proxy' &&
    e.data?.payload === 'init'
  ) {
    window.removeEventListener('message', handshake)

    let listeners: ((ev: MessageEvent) => void)[] = []
    const bridge = createBridge({
      listen: fn => {
        const listener = (evt: MessageEvent) => {
          if (
            evt.data?.source === 'intlify-devtools-proxy' &&
            evt.data?.payload
          ) {
            fn(evt.data.payload)
          }
        }
        window.addEventListener('message', listener)
        listeners.push(listener)
      },
      send: data => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.log('[backend] backend -> devtools', data)
        // }
        window.postMessage(
          {
            source: 'intlify-devtools-backend',
            payload: data
          },
          '*'
        )
      }
    })

    bridge.on('shutdown', () => {
      listeners.forEach(l => {
        window.removeEventListener('message', l)
      })
      listeners = []
    })

    setupBackend(bridge)
  } else {
    sendListening()
  }
}
