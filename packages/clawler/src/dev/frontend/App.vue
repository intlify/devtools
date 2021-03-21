<template>
  <h1>Dev Clawler!</h1>
  <nav>
    <div class="navigation">
      <router-link :to="{ name: 'home' }">Home</router-link>
      |
      <router-link :to="{ name: 'about' }">About</router-link>
    </div>
  </nav>
  <router-view></router-view>
  <button @click="count++">{{ count }}</button>
</template>

<script setup lang="ts">
import Hello from './Hello.vue'
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
nav {
  display: inline-flex;
}
.navigation {
  margin-right: 1rem;
}
</style>
