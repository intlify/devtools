<script setup lang="ts">
import { ref } from 'vue'
const name = ref('Slot')
</script>

<template>
  <h3>Hello {{ name }}!</h3>
</template>
