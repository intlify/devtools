import { createApp } from 'vue'
import App from './App.vue'
import {
  Foo,
  APP_FRONTNED,
  App as FrontApp
} from 'http://localhost:3000/frontend'

console.log(
  'load app-frontend via script tag at host',
  Foo,
  APP_FRONTNED,
  FrontApp
)

console.log('shell-dev: App', App)
createApp(App).mount('#app')
