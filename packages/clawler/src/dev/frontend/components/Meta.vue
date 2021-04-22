<template>
  <div>
    <h4>URL</h4>
    <p>{{ url }}</p>
    <h4>Components</h4>
    <ul>
      <li v-for="(path, index) in paths" :key="index">{{ path }}</li>
    </ul>
    <h4>Resource keys</h4>
    <ul>
      <li v-for="(value, key) in keys" :key="key">
        <h5>{{ key }}</h5>
        <p>{{ value }}</p>
      </li>
    </ul>
    <h4>Detect keys</h4>
    <ul>
      <li v-for="detect in detecting" :key="detect.devtool.key">
        <h5>
          key: {{ detect.devtool.key }}, format: {{ detect.devtool.format }},
          message: {{ detect.devtool.message }}
        </h5>
        <p>{{ detect.devtool.lineOrWord }}</p>
      </li>
    </ul>
    <h4>Screenshot</h4>
    <canvas ref="canvas" class="screenshot"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, defineProps } from 'vue'

import type { PropType } from 'vue'
import type { IntlifyDevToolsHookPayloads } from '@intlify/devtools-if'
import type { Line, Word } from 'tesseract.js'

const canvas = ref<HTMLCanvasElement>(null)

const props = defineProps({
  url: {
    type: String,
    default: () => ''
  },
  paths: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  keys: {
    type: Object,
    default: () => ({})
  },
  screenshot: {
    type: String,
    default: () => ''
  },
  detecting: {
    // type: Array,
    type: Object as PropType<
      {
        devtool: IntlifyDevToolsHookPayloads['function:translate']
        lineOrWord: Line | Word
      }[]
    >,
    default: () => []
  },
  notyet: {
    type: Array as PropType<(Line | Word)[]>,
    default: () => []
  }
})

watchEffect(() => {
  console.log('detecting', props.detecting)
  const img = new Image()
  img.onload = () => {
    const el = canvas.value
    el.width = img.width
    el.height = img.height
    const ctx = el.getContext('2d')
    ctx.drawImage(img, 0, 0)
    ctx.strokeStyle = 'blue'
    for (const { lineOrWord } of props.detecting) {
      ctx.strokeRect(
        lineOrWord.bbox.x0,
        lineOrWord.bbox.y0,
        lineOrWord.bbox.x1 - lineOrWord.bbox.x0,
        lineOrWord.bbox.y1 - lineOrWord.bbox.y0
      )
    }
    if (props.notyet.length) {
      ctx.strokeStyle = 'green'
      for (const lineOrWord of props.notyet) {
        ctx.strokeRect(
          lineOrWord.bbox.x0,
          lineOrWord.bbox.y0,
          lineOrWord.bbox.x1 - lineOrWord.bbox.x0,
          lineOrWord.bbox.y1 - lineOrWord.bbox.y0
        )
      }
    }
  }
  img.onerror = e => {
    console.error(e)
  }
  // @ts-ignore
  img.src = props.screenshot
})
</script>

<style scoped>
.screenshot {
  width: 100vw;
  border: solid red;
}
</style>
