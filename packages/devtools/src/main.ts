import { Component, createApp } from 'vue'
import App from './App.vue'

async function mount(Entry: Component, el?: string) {
  if (el) {
    const app = createApp(App)
    app.mixin({
      mounted() {
        const { _, $el } = this
        if (_ && _.type && _.type.__INTLIFY_META__ && $el) {
          if (
            $el.nodeType === Node.TEXT_NODE &&
            $el.nextSibling &&
            $el.nextSibling.nodeType === Node.ELEMENT_NODE
          ) {
            // for fragment
            const { nextSibling: nextEl } = $el
            nextEl.setAttribute('data-intlify', _.type.__INTLIFY_META__)
          } else {
            $el.setAttribute('data-intlify', _.type.__INTLIFY_META__)
          }
        }
      }
    })
    app.mount(el)
    // window.addEventListener('mousemove', (ev) => {
    //   console.log('ev', ev.offsetX, ev.offsetY, ev.clientX, ev.clientY)
    // })
    return { app }
  } else {
    const root = document.createElement('div')
    root.id = 'intlify-app'
    document.body.appendChild(root)
    const app = createApp(Entry).mount(root)
    return { app, root }
  }
}

;(async () => {
  if (import.meta.env.DEV) {
    mount(App, '#app')
  } else if (import.meta.env.PROD) {
    if (document.readyState !== 'loading') {
      mount(App)
      return
    }
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('load 3rd part script')
      mount(App)
    })
  }
})().catch((e: Error) => {
  console.error(e)
})
