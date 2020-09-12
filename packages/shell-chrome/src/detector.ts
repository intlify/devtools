import { browser } from 'webextension-polyfill-ts'
// import * as Comlink from 'comlink'
// import { createEndpoint, forward } from 'comlink-extension'

console.log('load detector!', window)

// browser.runtime.connect()
// Wrap a chrome.runtime.Port
// const obj = Comlink.wrap(createEndpoint(browser.runtime.connect())) as any
// obj.test('detector (popup)')

/*
window.addEventListener('message', (e: MessageEvent) => {
  console.log('recive on mesasge', e)
})
*/
