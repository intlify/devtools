import { createApp } from 'vue'
import App from './App.vue'

function mount(Entry: any) {
  const root = document.createElement('div')
  root.id = 'intlify-app'
  document.body.appendChild(root)
  const app = createApp(Entry).mount(root)
  return { app, root }
}

;(async () => {
  console.log('entry', App)

  if (document.readyState !== 'loading') {
    mount(App)
    return
  }
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('load 3rd part script')
    mount(App)
  })
})().catch((e: Error) => {
  console.error(e)
})
