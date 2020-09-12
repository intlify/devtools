import { Devtools } from './FService'

export interface BService {
  // eslint-disable-next-line @typescript-eslint/ban-types
  add(a: number, b: number, cb: Function): number
  send(msg: string): void
  registerDevtools(dev: Devtools): void
  highlight(id: number): void
}

let devtools: Devtools | null = null

// eslint-disable-next-line @typescript-eslint/ban-types
export async function add(a: number, b: number, cb: Function): number {
  console.log('call add', a, b, cb, window)
  const ret = await cb('backend!')
  console.log('cb ret', ret)
  return a + b
}

export function send(msg: string): void {
  console.log('send', msg)
}

export function registerDevtools(dev: Devtools): void {
  console.log('registerDevtools!', dev)
  devtools = dev
}

export function highlight(id: number, loc = ''): void {
  console.log(`[${loc}] component ${id} highlight!`, window, devtools)
  devtools?.inspect(`inspect ${id} !`)
}

// const btn = document.getElementById('button1')
// btn?.addEventListener('click', ev => {
//   highlight(ev.timeStamp)
// })

// window.addEventListener('mousemove', ev => {
//   highlight(ev.x)
// })
