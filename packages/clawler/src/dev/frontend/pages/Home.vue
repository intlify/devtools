<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const title = ref('Home')
onMounted(() => console.log('mounted Home'))
onUnmounted(() => console.log('unmounted Home'))
</script>

<template>
  <h2>{{ title }}</h2>
  <p>This page is home page</p>
</template>
