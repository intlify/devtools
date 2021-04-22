<template>
  <div class="your-app">
    <h1>{{ t('title') }}</h1>
    <p>{{ t('banana', { n: count }) }}</p>
    <div class="quantity">
      <span>{{ t('quantity') }}</span>
      <button @click="count++">{{ count }}</button>
    </div>
    <nav>
      <div class="navigation">
        <router-link :to="{ name: 'home' }">{{ t('pages.home') }}</router-link>
        |
        <router-link :to="{ name: 'about' }">{{
          t('pages.about')
        }}</router-link>
      </div>
      <input v-model="toggle" type="checkbox" />
      <label style="display: flex">
        <On v-if="toggle"></On>
        <Off v-else></Off>
      </label>
    </nav>
    <router-view></router-view>
  </div>
  <hr />

  <div class="l10n-operations">
    <h2>Phrase API operations</h2>
    <a href="javascript:void(0);" @click="onClickResourceUpload"
      >Upload Resource</a
    >
    <br />
    <a href="javascript:void(0);" @click="onClickScreenshot"
      >Upload Screenshot</a
    >
  </div>
  <hr />

  <div class="devtools">
    <h2>Devtools panel (Intlify Devtools prototype)</h2>
    <a href="javascript:void(0);" @click="onClickFetch($i18n.locale)"
      >Click fetch Meta</a
    >
    <Meta v-if="meta != null" v-bind="meta" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUpdated, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { getEndPoint } from '../../helper'

import Hello from './components/Hello.vue'
import Meta from './components/Meta.vue'
import On from './components/On.vue'
import Off from './components/Off.vue'

const { t } = useI18n({ inheritLocale: true, useScope: 'global' })

const count = ref(0)
const toggle = ref(false)
const meta = ref(null)

const onClickFetch = async (locale: string) => {
  console.log('clicke locale', locale)
  const { url, paths, keys, screenshot, detecting, notyet } = await (
    await fetch(
      `${getEndPoint()}?url=${encodeURIComponent(
        window.location.href
      )}&locale=${locale}`
    )
  ).json()
  meta.value = {
    url,
    paths,
    keys,
    screenshot,
    detecting,
    notyet
  }
  console.log('fetch data', meta.value)
}

const onClickResourceUpload = async () => {
  const res = await fetch(`${getEndPoint()}/upload`)
  console.log('upload res', res)
}

const onClickScreenshot = async () => {
  const res = await fetch(
    `${getEndPoint()}/upload?sh=true&url=${encodeURIComponent(
      window.location.href
    )}`
  )
  console.log('upload screenshot', res)
}
</script>

<style scoped>
nav {
  display: inline-flex;
}
.navigation {
  margin-right: 1rem;
}
.quantity {
  margin-bottom: 24px;
}
.quantity button {
  margin-left: 12px;
}
.your-app {
  margin-bottom: 96px;
}
.l10n-operations {
  margin-bottom: 48px;
}
</style>
