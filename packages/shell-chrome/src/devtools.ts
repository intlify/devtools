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
import { mod } from './FService'

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

;(async () => {
  // Wrap a chrome.runtime.Port
  const name = browser.devtools.inspectedWindow.tabId + ''
  Comlink.expose(mod, createEndpoint(browser.runtime.connect({ name })))
  setInterval(async () => {
    const ret = await mod.requestElementTag(new Date().getTime())
    console.log('[devtools] requestElementTag -> ', ret)
  }, 5000)

  try {
    const ret = await inejctScript(browser.runtime.getURL('build/backend.js'))
    console.log('inejct script', ret)
  } catch (e) {
    console.error(e)
  }
})()
