<template>
  <p>Intlify Devtools App</p>
  <HelloWorld msg="Intlify devtools here!!" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld
  }
})
</script>

<style scoped></style>
