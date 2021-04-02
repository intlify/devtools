<script setup lang="ts">
import { ref } from 'vue'
const title = ref('About')
</script>

<template>
  <h2>{{ title }}</h2>
  <p>This page <span>is</span> about page</p>
  <slot></slot>
</template>
