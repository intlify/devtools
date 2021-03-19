<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { attachWorker } from '@intlify/worker-dom/dist/lib/main'
import WorkerDOM from './worker?worker'
import { onMounted, nextTick as waitForFullyMount, ref } from 'vue'
import html2canvas from 'html2canvas'
import Tesseract from 'tesseract.js'

let worker: any = null
const metaInfo = ref<string[]>([])
const lines = ref<string[]>([])

onMounted(async () => {
  await waitForFullyMount()
  worker = await attachWorker(document.body, new WorkerDOM())
})

const onClickMetaInfo = async () => {
  if (worker == null) {
    return
  }
  const ret = await worker.callFunction('getIntlifyMetaInfo')
  console.log('ret', ret, window.location.href)
  metaInfo.value = ret
}

const onClickCapture = async () => {
  const canvas = await html2canvas(document.body)
  console.log('body', document.body)
  console.log('canvas', canvas)
  // document.body.appendChild(canvas)
  const ret = await Tesseract.recognize(canvas, 'eng', {
    logger: m => console.log(m)
  })
  const _lines = ret.data.lines
  lines.value = _lines.map(line => line.text)
  _lines.forEach(l => {
    console.log(
      'eele',
      document.elementsFromPoint(l.bbox.x0 + 1, l.bbox.y0 + 1)
    )
    const el = document.elementFromPoint(l.bbox.x0 + 1, l.bbox.y0 + 1)
    // const el = document.elementFromPoint(x, y)
    console.log('el', l, el)
  })
  console.log('recognize', ret)
}
</script>

<template>
  <p>Intlify Devtools App</p>
  <HelloWorld msg="Intlify devtools here!!" />
  <button @click="onClickMetaInfo">get meta info</button>
  <button @click="onClickCapture">capture</button>
  <h2>Component meta info</h2>
  <ul>
    <li v-for="(meta, index) in metaInfo" :key="index">{{ meta }}</li>
  </ul>
  <h2>Detect texts with OCR</h2>
  <ul>
    <li v-for="(line, index) in lines" :key="index">{{ line }}</li>
  </ul>
</template>

<style>
#app {
  margin: 2rem 0;
}
.detect {
  border-style: solid;
  border-color: red;
}
</style>
