/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/hook.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

console.log('[hook] load hook!', window)

// TODO: should replace from @intlify-devtools/backend
function installHook() {
  console.log('[hook] install hook!')
}

// inject the hook
if (document instanceof HTMLDocument) {
  const source = ';(' + installHook.toString() + ')(window)'

  const script = document.createElement('script')
  script.textContent = source
  document.documentElement.appendChild(script)
  script.parentNode?.removeChild(script)
}
