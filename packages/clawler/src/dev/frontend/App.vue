<template>
  <h1>Dev Clawler!</h1>
  <nav>
    <div class="navigation">
      <router-link :to="{ name: 'home' }">Home</router-link>
      |
      <router-link :to="{ name: 'about' }">About</router-link>
    </div>
    <input type="checkbox" v-model="toggle">
    <On v-if="toggle"></On>
    <Off v-else></Off>
  </nav>
  <router-view></router-view>
  <button @click="count++">{{ count }}</button>
</template>

<script setup lang="ts">
import Hello from './Hello.vue'
import On from './On.vue'
import Off from './Off.vue'
import { ref } from 'vue'

const count = ref(0)
const toggle = ref(false)
</script>

<style scoped>
nav {
  display: inline-flex;
}
.navigation {
  margin-right: 1rem;
}
</style>
