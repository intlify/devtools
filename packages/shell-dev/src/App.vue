<template>
  <img class="logo" alt="Intlify logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Intlify Devtools with Vite !" />
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineComponent } from 'vue'
import { HelloWorld } from 'http://localhost:3000/frontend'
/* eslint-enable @typescript-eslint/no-unused-vars */
</script>

<style>
.logo {
  width: 256px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
