<template>
  <h1>{{ t('title') }}</h1>
  <p>{{ t('banana', { n: count }) }}</p>
  <nav>
    <div class="navigation">
      <router-link :to="{ name: 'home' }">{{ t('pages.home') }}</router-link>
      |
      <router-link :to="{ name: 'about' }">{{ t('pages.about') }}</router-link>
    </div>
    <input v-model="toggle" type="checkbox" />
    <On v-if="toggle"></On>
    <Off v-else></Off>
  </nav>
  <router-view></router-view>
  <button @click="count++">{{ count }}</button>
  <hr />
  <h2>Meta Info</h2>
  <a href="javascript:void(0);" @click="onClickFetch($i18n.locale)"
    >Click fetch Meta</a
  >
  <Meta v-if="meta != null" v-bind="meta" />
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
  const { url, paths, keys, screenshot, detecting } = await (
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
    detecting
  }
  console.log('fetch data', meta.value)
}
</script>

<style scoped>
nav {
  display: inline-flex;
}
.navigation {
  margin-right: 1rem;
}
</style>
