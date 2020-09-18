import { Runtime, browser } from 'webextension-polyfill-ts'
import * as Comlink from 'comlink'
// import {
//   createBackgroundEndpoint,
//   isMessagePort,
//   forward
// } from 'comlink-extension'
import { createBackgroundEndpoint, isMessagePort, forward } from './comlink-ext'
import * as BService from './BService'
import { mod } from './FService'

console.log('[background] load background!')

/*
browser.runtime.onConnect.addListener(port => {
  console.log('onConnect', port)
})
*/

function callback(msg: string): string {
  console.log('[background] add callback', msg, window)
  return msg
}
/*
const callbackProxy = Comlink.proxy(callback)
console.log(
  '[backend] add',
  await bend.add(1, 3, callbackProxy),
  window
)
await bend.registerDevtools(Comlink.proxy(mod))
*/

type PipeLine = {
  backend?: Runtime.Port
  devtools?: Runtime.Port
}

const ports = new Map<string, PipeLine>()

browser.runtime.onConnect.addListener(port => {
  console.log('[background] port', port)
  if (isMessagePort(port)) {
    return
  }

  /*
  let tab = ''
  let name = ''
  if (isNumeric(port.name)) {
    tab = port.name
    name = 'devtools'
  } else {
    tab = port.sender?.tab?.id?.toString() ?? ''
    name = 'backend'
  }

  if (!tab) {
    return
  }

  if (!ports.get(tab)) {
    ports.set(tab, {})
  }
  ;(ports.get(tab) as any)[name] = port

  if (ports.get(tab)?.devtools && ports.get(tab)?.backend) {
    // @ts-ignore TODO:
    pipeTwoway(tab, ports.get(tab)?.devtools, ports.get(tab)?.backend)
  }
  */

  // Comlink.expose(BService, createBackgroundEndpoint(port))
  console.log('expors !!')
  Comlink.expose(mod, createBackgroundEndpoint(port))

  // setInterval(async () => {
  //   const ret = await mod.requestElementTag(new Date().getTime())
  //   console.log('[background] requestElementTag -> ', ret)
  // }, 5000)
})

function isNumeric(str: string): boolean {
  return +str + '' === str
}

function pipeTwoway(id: string, one: Runtime.Port, two: Runtime.Port): void {
  one.onMessage.addListener(onMessageOne)
  function onMessageOne(message: string) {
    console.log('[background] devtools -> backend', message)
    two.postMessage(message)
  }
  two.onMessage.addListener(onMessageTwo)
  function onMessageTwo(message: string): void {
    console.log('[background] backend -> devtools', message)
    one.postMessage(message)
  }
  function shutdown() {
    console.log(`[background] tab ${id} disconnected`)
    one.onMessage.removeListener(onMessageOne)
    two.onMessage.removeListener(onMessageTwo)
    one.disconnect()
    two.disconnect()
    ports.delete(id)
  }
  one.onDisconnect.addListener(shutdown)
  two.onDisconnect.addListener(shutdown)
  console.log(`[background] tab ${id} connected`)
}
