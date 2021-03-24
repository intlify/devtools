<template>
  <div>
    <h4>URL</h4>
    <p>{{ url }}</p>
    <h4>Components</h4>
    <ul>
      <li v-for="(path, index) in paths" :key="index">{{ path }}</li>
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
  screenshot: {
    type: String,
    default: () => ''
  }
})
</script>

<style scoped>
.screenshot {
  width: 100vw;
}
</style>
