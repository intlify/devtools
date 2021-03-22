import { attachWorker } from '@intlify/worker-dom/dist/lib/main'
import WorkerDOM from './worker?worker'

import type { MetaInfo } from './types'

export default async function clawl(el: HTMLElement, Worker?: any) {
  console.log('clawler run!', el)
  const worker = await attachWorker(el, Worker ? new Worker() : new WorkerDOM())

  observeDOM(el, worker)

  console.log('... ready worker')
  await worker.callFunction('ready')
  console.log('... done worker!')

  const { url, meta } = await worker.callFunction('walkElements', window.location.href)
  console.log('collect meta', meta)
  console.log('page url', url)

  const body = {
    url,
    meta,
    timestamp: new Date().getTime()
  }
  const res = await worker.callFunction('pushMeta', getEndPoint(), body)
  console.log('backend res', res, import.meta.env)
}

function observeDOM(el: HTMLElement, worker: any) {
  const observer = new MutationObserver(async mutations => {
    const body: Record<string, any> = {
      url: window.location.href,
      removed: [],
      added: []
    }
    mutations.forEach(mutation => {
      // console.log(mutation)
      mutation.addedNodes.forEach(node => walkElements(node, body.added))
      mutation.removedNodes.forEach(node => walkElements(node, body.removed))
    })

    if (isEmpty(body.removed) && isEmpty(body.added)) {
      return
    }

    body.timestamp = new Date().getTime()
    const res = await worker.callFunction('pushMeta', getEndPoint(), body)
    console.log('backend res', res, import.meta.env)
  })

  observer.observe(el, { childList: true, subtree: true })
}

function isEmpty(items: unknown[]) {
  return items.length === 0
}

function getEndPoint() {
  return import.meta.env.VITE_BASE_ENDPOINT as string
}

function walkElements(node: any, metaInfo: MetaInfo) {
  const { __INTLIFY_META__ } = node
  __INTLIFY_META__ && metaInfo.push(__INTLIFY_META__)
  node.childNodes.forEach((node: any) => walkElements(node, metaInfo))
}