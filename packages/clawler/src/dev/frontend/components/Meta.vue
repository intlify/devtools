<template>
  <div>
    <h4>URL</h4>
    <p>{{ url }}</p>
    <h4>Components</h4>
    <ul>
      <li v-for="(path, index) in paths" :key="index">{{ path }}</li>
    </ul>
    <h4>Resource keys</h4>
    <ul>
      <li v-for="(value, key) in keys" :key="key">
        <h5>{{ key }}</h5>
        <p>{{ value }}</p>
      </li>
    </ul>
    <h4>Screenshot</h4>
    <img v-if="screenshot" class="screenshot" :src="screenshot" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: () => ''
  },
  paths: {
    type: Array,
    default: () => []
  },
  keys: {
    type: Object,
    default: () => ({})
  },
  screenshot: {
    type: String,
    default: () => ''
  }
})
</script>

<style scoped>
.screenshot {
  width: 100vw;
  border: solid red;
}
</style>
