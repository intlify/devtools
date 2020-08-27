<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import Child from './Child.vue'

export default defineComponent({
  name: 'App',
  components: {
    Child
  },
  setup() {
    return { ...useI18n() }
  }
})
</script>

<template>
  <h1>{{ t('hello') }}</h1>
  <Child/>
</template>
