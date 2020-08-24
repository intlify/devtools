import { browser } from 'webextension-polyfill-ts'

console.log('load background!')

browser.runtime.onConnect.addListener(port => {
  console.log('onConnect', port)
})
