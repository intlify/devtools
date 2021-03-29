import { createApp, nextTick as waitForFullyMount } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { mixin } from './mixin'
import { default as clawle } from '../../main'

createApp(App).mixin(mixin).use(router).use(i18n).mount('#app')
;(async () => {
  await waitForFullyMount()
  clawle(document.body)
})()
