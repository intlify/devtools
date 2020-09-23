/**
 * DevTools module on Chrome extensions, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shell-chrome/src/background.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { browser, Runtime as WebExtRuntime } from 'webextension-polyfill-ts'

type TabName = 'backend' | 'devtools'
type PipeLine = Record<TabName, WebExtRuntime.Port | null>

console.log('[background] load background!')

const ports = new Map<string, PipeLine>()

browser.runtime.onConnect.addListener(async (port: WebExtRuntime.Port) => {
  console.log('[background] onConnect', port)

  let tab: string | undefined
  let name: TabName
  if (isNumeric(port.name)) {
    tab = port.name
    name = 'devtools'
    await installProxy(+tab)
  } else {
    // @ts-ignore
    tab = port.sender.tab.id.toString()
    // NOTE: Why can't we resolve the nested optional chaining ? ...
    // tab = port.sender?.tab?.id?.toString()
    name = 'backend'
  }

  if (tab == null) {
    console.warn('[background] tab is noting')
    return
  }

  if (!ports.has(tab) || ports.get(tab) == null) {
    ports.set(tab, {
      devtools: null,
      backend: null
    })
  }
  ;(ports.get(tab) as PipeLine)[name] = port

  if (ports.get(tab)?.devtools && ports.get(tab)?.backend) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    doublePipe(tab, ports.get(tab)?.devtools!, ports.get(tab)?.backend!)
  }
})

function isNumeric(str: string): boolean {
  return +str + '' === str
}

async function installProxy(tabId: number): Promise<void> {
  try {
    const res = await browser.tabs.executeScript(tabId, {
      file: '/build/proxy.js'
    })
    if (!res) {
      ports.get(tabId.toString())?.devtools?.postMessage('proxy-fail')
    } else {
      console.log(`[background] injected proxy to tab ${tabId}`)
    }
  } catch (e) {
    console.error('[background] executeScript error', e.message)
    ports.get(tabId.toString())?.devtools?.postMessage('proxy-fail')
  }
}

function doublePipe(
  id: string,
  one: WebExtRuntime.Port,
  two: WebExtRuntime.Port
): void {
  one.onMessage.addListener(lOne)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function lOne(message: any) {
    if (message.event === 'log') {
      return console.log('tab ' + id, message.payload)
    }
    console.log('[background] devtools -> backend', message)
    two.postMessage(message)
  }
  two.onMessage.addListener(lTwo)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function lTwo(message: any) {
    if (message.event === 'log') {
      return console.log(`[background] tab ${id}`, message.payload)
    }
    console.log('[background] `backend -> devtools', message)
    one.postMessage(message)
  }
  function shutdown() {
    console.log(`[background] tab ${id} disconnected`)
    one.onMessage.removeListener(lOne)
    two.onMessage.removeListener(lTwo)
    one.disconnect()
    two.disconnect()
    ports.delete(id)
  }
  one.onDisconnect.addListener(shutdown)
  two.onDisconnect.addListener(shutdown)
  console.log(`[background] tab ${id} connected`)
}
