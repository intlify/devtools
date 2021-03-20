import { attachWorker } from '@intlify/worker-dom/dist/lib/main'
import WorkerDOM from './worker?worker'

export default async function clawle(el: HTMLElement, Worker?: any) {
  console.log('clawler run!', el)
  const worker = await attachWorker(el, Worker ? new Worker() : new WorkerDOM())

  const meta = await worker.callFunction('getIntlifyMetaInfo')
  console.log('collect meta', meta)
  const url = window.location.href
  console.log('page url', url)
}
