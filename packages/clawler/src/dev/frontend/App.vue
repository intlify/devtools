<template>
  <h1>{{ t('title') }}</h1>
  <nav>
    <div class="navigation">
      <router-link :to="{ name: 'home' }">Home</router-link>
      |
      <router-link :to="{ name: 'about' }">About</router-link>
    </div>
    <input v-model="toggle" type="checkbox" />
    <On v-if="toggle"></On>
    <Off v-else></Off>
  </nav>
  <router-view></router-view>
  <button @click="count++">{{ count }}</button>
  <hr />
  <h2>Meta Info</h2>
  <a href="javascript:void(0);" @click="onClickFetch">Click fetch Meta</a>
  <Meta v-if="meta != null" v-bind="meta" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const onClickFetch = async () => {
  const { url, paths, screenshot } = await (
    await fetch(
      `${getEndPoint()}?url=${encodeURIComponent(window.location.href)}`
    )
  ).json()
  meta.value = {
    url,
    paths,
    screenshot
  }
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
