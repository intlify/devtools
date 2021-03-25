<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n({
  inheritLocale: true,
  useScope: 'global'
})
</script>

<template>
  <p>{{ t('comoponents.on') }}</p>
</template>
