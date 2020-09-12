/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/devtools.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser } from 'webextension-polyfill-ts'
import * as Comlink from 'comlink'
import { createEndpoint, forward } from 'comlink-extension'
import { BService } from './BService'
import { mod } from './FService'

type Foo = {
  foo?: (msg: string) => void
}

const foo: Foo = {
  foo(msg) {
    console.log(msg)
  }
}

foo.foo?.('foo devtools!')
console.log('load devtools!', window)

/**
 * Inject a globally evaluated script, in the same context with the actual user app.
 */
function inejctScript(scriptName: string) {
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `
  return browser.devtools.inspectedWindow.eval(src)
}

function callback(msg: string): string {
  console.log('add callback', msg, window)
  return msg
}

;(async () => {
  // Wrap a chrome.runtime.Port
  const name = browser.devtools.inspectedWindow.tabId + ''
  const bridge = Comlink.wrap<BService>(
    createEndpoint(browser.runtime.connect({ name }))
  )
  console.log('bridge ', bridge)
  await bridge.send('heheheheh')
  console.log(
    'add',
    await bridge.add(1, 3, Comlink.proxy(callback)),
    bridge,
    window
  )
  await bridge.registerDevtools(Comlink.proxy(mod))

  try {
    const ret = await inejctScript(browser.runtime.getURL('build/backend.js'))
    console.log('inejct script', ret)
  } catch (e) {
    console.error(e)
  }
})()
