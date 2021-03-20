import { createApp, nextTick as waitForFullyMount } from 'vue'
import App from './App.vue'
import { mixin } from './mixin'
import { default as clawle } from '../main'

createApp(App)
  .mixin(mixin)
  .mount('#app')

;(async() => {
  await waitForFullyMount()

  clawle(document.body)
})()
