import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      hello: 'Hello Intlify DevTools!'
    },
    ja: {
      hello: 'こんにちは、Intlify 開発ツール!'
    }
  }
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
