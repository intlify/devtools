import { createI18n } from 'vue-i18n'
import messages from '@intlify/vite-plugin-vue-i18n/messages'
// import enUS from './locales/en-US.json'
// import jaJP from './locales/ja-JP.json'

console.log('load messages', messages)
// console.log('load messages', enUS, jaJP)

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  // locale: 'ja-JP',
  fallbackLocale: 'en-US',
  globalInjection: true,
  // messages: {
  //   'en-US': enUS,
  //   'ja-JP': jaJP
  // }
  messages
})

export default i18n
