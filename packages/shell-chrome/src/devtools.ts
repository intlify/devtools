/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/devtools.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser } from 'webextension-polyfill-ts'
import { setupDevtools } from '@intlify-devtools/app-frontend'
import { Bridge, createBridge } from '@intlify-devtools/shared'

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

/**
 * entry point of devtools
 */
;(async () => {
  try {
    let bridge: Bridge

    setupDevtools({
      connect: async cb => {
        // 1. inject backend code into page
        await inejctScript(browser.runtime.getURL('build/backend.js'))

        // 2. connect to background to setup proxy
        // @ts-ignore
        const port = browser.runtime.connect({
          name: browser.devtools.inspectedWindow.tabId.toString()
        })
        let disconnected = false
        port.onDisconnect.addListener(() => {
          console.log('[devtools] disconnect!')
          disconnected = true
        })
        bridge = createBridge({
          listen: fn => {
            port.onMessage.addListener(fn)
          },
          send: data => {
            if (!disconnected) {
              port.postMessage(data)
            }
          }
        })

        // 3. send a proxy API to the panel
        cb(bridge)
      },

      onReload: cb => {
        browser.devtools.network.onNavigated.addListener(url => {
          console.log('[devtools] devtools.network.onNavigated', url)
          cb(bridge)
        })
      }
    })
  } catch (e) {
    console.error('[devtools]', e)
  }
})()
