<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({
  inheritLocale: true,
  useScope: 'global'
})
const name = ref('Slot')
</script>

<template>
  <h3>{{ t('comoponents.hello.greeting') }}</h3>
</template>
