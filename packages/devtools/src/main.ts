import { Component, createApp } from 'vue'
import App from './App.vue'

function mount(Entry: Component, el?: string) {
  if (el) {
    const app = createApp(App).mount(el)
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
