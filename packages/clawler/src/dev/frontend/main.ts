import { createApp, nextTick as waitForFullyMount } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import About from './About.vue'
import { mixin } from './mixin'
import { default as clawle } from '../../main'

import type { Router, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => `/`
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).mixin(mixin).use(router).mount('#app')

;(async () => {
  await waitForFullyMount()

  clawle(document.body)
})()
