/**
 * Backend module on chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/backend.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

console.log('load backend!', window)

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
