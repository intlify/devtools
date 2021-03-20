import { createApp, nextTick } from 'vue'
import App from './App.vue'
import { default as clawle } from '@intlify/clawler'
import WorkerDOM from '@intlify/clawler/dist/worker?worker'

console.log('shell-dev: App', App)

const app = createApp(App)
app.mixin({
  mounted() {
    if (this._ && this._.type && this._.type.__INTLIFY_META__ && this.$el) {
      if (this.$el.nodeType === 3) {
        // text node (fragmenet)
        this.$el.__INTLIFY_META__ = this._.type.__INTLIFY_META__
      } else {
        this.$el.setAttribute('data-intlify', this._.type.__INTLIFY_META__)
        this.$el.__INTLIFY_META__ = this._.type.__INTLIFY_META__
      }
    }
  }
})
app.mount('#app')

;(async() => {
  await nextTick()
  clawle(document.body, WorkerDOM)
})()
