import { hook } from '../../hook'
import { createApp, nextTick as waitForFullyMount } from 'vue'
import App from './App.vue'
import router from './router'
import { mixin } from './mixin'

import { default as clawl } from '../../main'
const doClawl = clawl(hook)

function checkScreenshotRequest() {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.searchParams)
  console.log(
    'checkStreeshot',
    url,
    window.location.href,
    params.has('screenshot')
  )
  return params.has('screenshot')
}

;(async () => {
  const { default: i18n } = await import('./i18n')
  createApp(App).mixin(mixin).use(router).use(i18n).mount('#app')
  await waitForFullyMount()
  if (checkScreenshotRequest()) {
    return
  }
  await doClawl(document.body)
})()
