<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const title = ref('About')
onMounted(() => console.log('mounted About'))
onUnmounted(() => console.log('unmounted About'))
</script>

<template>
  <h2>{{ title }}</h2>
  <p>This page <span>is</span> about page</p>
  <slot></slot>
</template>
