import html2canvas from 'html2canvas'
import { attachWorker } from '@intlify/worker-dom/dist/lib/main'
import WorkerDOM from './worker?worker'
import { isEmpty, getEndPoint } from './helper'

import type { MetaInfo } from './types'

export default async function clawl(el: HTMLElement, Worker?: any) {
  console.log('clawler run!', el)
  const worker = await attachWorker(el, Worker ? new Worker() : new WorkerDOM())

  observeDOM(el, worker)

  console.log('... ready worker')
  await worker.callFunction('ready')
  console.log('... done worker!')

  const { url, meta, text } = await worker.callFunction(
    'walkElements',
    window.location.href
  )
  console.log('collect', meta, text)
  console.log('page url', url)

  // const canvas = await html2canvas(document.body)

  const body = {
    url,
    meta,
    text,
    // screenshot: canvas.toDataURL(),
    timestamp: new Date().getTime()
  }
  const res = await worker.callFunction('pushMeta', getEndPoint(), body)
  console.log('backend res', res, import.meta.env)
}

type MutationRecord = {
  url: string
  removed: string[]
  added: string[]
  text: string[]
  timestamp?: number
}

function observeDOM(el: HTMLElement, worker: any) {
  const observer = new MutationObserver(async mutations => {
    const body: MutationRecord = {
      url: window.location.href,
      removed: [],
      added: [],
      text: []
    }
    const textSet = new Set<string>()

    mutations.forEach(mutation => {
      console.log('mutaion observer', mutation)
      mutation.addedNodes.forEach(node => {
        walkElements('added', node, mutation.target, body)
        walkTargetElement(mutation.target, textSet)
      })
      mutation.removedNodes.forEach(node =>
        walkElements('removed', node, mutation.target, body)
      )
    })

    body.text = [...textSet]
    body.timestamp = new Date().getTime()
    console.log('text set', body.text)

    if (isEmpty(body.removed) && isEmpty(body.added) && isEmpty(body.text)) {
      return
    }

    // const canvas = await html2canvas(document.body)
    // body.screenshot = canvas.toDataURL()

    console.log('send body ...', body)
    const res = await worker.callFunction('pushMeta', getEndPoint(), body)
    console.log('backend res', res, import.meta.env)
  })

  observer.observe(el, { childList: true, subtree: true })
}

function isDOMElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function walkTargetElement(node: Node, text: Set<string>) {
  node.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      text.add(node.textContent)
    }
    if (node.childNodes) {
      walkTargetElement(node, text)
    }
  })
}

function walkElements(
  type: 'added' | 'removed',
  node: Node,
  target: Node,
  body: MutationRecord
) {
  const { __INTLIFY_META__ } = node as any
  const metaInfo = body[type]
  if (isDOMElementNode(target)) {
    // console.log('target position', type, target, target.getBoundingClientRect())
    if (isDOMElementNode(node)) {
      // console.log('node position', type, node, node.getBoundingClientRect())
    } else {
      // console.log('node', node)
    }
  }
  __INTLIFY_META__ && metaInfo.push(__INTLIFY_META__)
  node.childNodes.forEach(node => walkElements(type, node, target, body))
  // target.childNodes.forEach(node => {
  //   console.log('enum', node.nodeType, (node.nodeType === Node.ELEMENT_NODE ? (node as Element).tagName : ''), node.textContent, node.textContent?.length)
  // })
}
