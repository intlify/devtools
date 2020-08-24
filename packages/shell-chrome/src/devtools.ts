/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/devtools.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser } from 'webextension-polyfill-ts'

type Foo = {
  foo?: (msg: string) => void
}

const foo: Foo = {
  foo(msg) {
    console.log(msg)
  }
}

foo.foo?.('foo devtools!')

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
 * main of devtools module
 */
;(async () => {
  try {
    const ret = await inejctScript(browser.runtime.getURL('build/backend.js'))
    console.log('inejct script', ret)
  } catch (e) {
    console.error(e)
  }
})()
