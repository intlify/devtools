import { attachWorker } from '@intlify/worker-dom/dist/lib/main'
import WorkerDOM from './worker?worker'

export default async function clawl(el: HTMLElement, Worker?: any) {
  console.log('clawler run!', el)
  const worker = await attachWorker(el, Worker ? new Worker() : new WorkerDOM())

  observeDOM(el, worker)

  const meta = await worker.callFunction('getIntlifyMetaInfo')
  console.log('collect meta', meta)
  const url = window.location.href
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
    mutations.forEach(mutation => {
      console.log(mutation)
    })
    const meta = await worker.callFunction('walkElement')
    console.log('collect meta', meta)
    const url = window.location.href
    console.log('page url', url)
    const body = {
      url,
      meta,
      timestamp: new Date().getTime()
    }
    const res = await worker.callFunction('pushMeta', getEndPoint(), body)
    console.log('backend res', res, import.meta.env)
  })

  observer.observe(el, { childList: true, subtree: true })
}

function getEndPoint() {
  return import.meta.env.VITE_BASE_ENDPOINT as string
}

async function pushMeta(endpoint: string, body: Record<string, unknown>) {
  return (
    await fetch(endpoint, {
      method: 'post',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  ).json()
}
