<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Child',
  setup() {
    const { t, locale } = useI18n({
      locale: 'en',
      inheritLocale: true,
      messages: {}
    })
    return { t, locale }
  }
})
</script>

<template>
  <h2>{{ t('hello') }}</h2>
  <form>
    <label>{{ t('language') }}</label>
    <select v-model="locale">
      <option value="en">en</option>
      <option value="ja">ja</option>
    </select>
  </form>
</template>

<i18n>
{
  "en": {
    "hello": "Hello, Child!",
    "language": "Languages"
  },
  "ja": {
    "hello": "こんにちは、チャイルド",
    "language": "言語"
  }
}
</i18n>
