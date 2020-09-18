import { browser, Runtime } from 'webextension-polyfill-ts'
import * as Comlink from 'comlink'

const SYMBOL = '__PORT__@'

export type PortResolver = (id: string) => ResolvablePort
export type PortDeserializer = (id: string) => MessagePort

export type ResolvablePort = Promise<Runtime.Port> | Runtime.Port | string

function _resolvePort(id: string) {
  return id
}

function _deserializePort(id: string) {
  const { port1, port2 } = new MessageChannel()
  forward(port1, id, _resolvePort, _deserializePort)
  return port2
}

export function createEndpoint(
  port: Runtime.Port,
  resolvePort: PortResolver = _resolvePort,
  deserializePort: PortDeserializer = _deserializePort
): Comlink.Endpoint {
  const listeners = new WeakMap()

  function serialize(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((value, i) => {
        serialize(value)
      })
    } else if (data && typeof data === 'object') {
      if (data instanceof MessagePort) {
        const id = SYMBOL + `${+new Date()}${Math.random()}`
        ;(data as any)[SYMBOL] = 'port'
        ;(data as any).port = id
        console.log('adapter#serialize', data)
        forward(data, resolvePort(id), resolvePort, deserializePort)
      } else if (data instanceof ArrayBuffer) {
        ;(data as any)[SYMBOL] =
          data instanceof Uint8Array
            ? 'uint8'
            : data instanceof Uint16Array
            ? 'uint16'
            : data instanceof Uint32Array
            ? 'uint32'
            : 'buffer'
        ;(data as any).blob = URL.createObjectURL(new Blob([data]))
      } else {
        for (const key in data) {
          serialize(data[key])
        }
      }
    }
  }

  async function deserialize(data: any, ports: any[]): Promise<any> {
    if (Array.isArray(data)) {
      await Promise.all(
        data.map(async (value, i) => {
          data[i] = await deserialize(value, ports)
        })
      )
    } else if (data && typeof data === 'object') {
      const type = data[SYMBOL]

      const pp = port
      if (type === 'port') {
        const port = deserializePort(data.port)
        console.log('adapter#desirialize', pp, data.port, port, ports)
        ports.push(port)
        return port
      } else if (type) {
        const url = new URL(data.blob)
        if (url.protocol === 'blob:') {
          const buffer = await (await fetch(url.href)).arrayBuffer()
          switch (type) {
            case 'uint16=':
              return new Uint16Array(buffer)
            case 'uint8':
              return new Uint8Array(buffer)
            case 'uint32':
              return new Uint32Array(buffer)
            case 'buffer':
              return buffer
          }
        }
      }

      await Promise.all(
        Object.keys(data).map(async key => {
          data[key] = await deserialize(data[key], ports)
        })
      )
    }

    return data
  }

  return {
    postMessage: (message, transfer: MessagePort[]) => {
      console.log('adapter:postmessage', port, message, transfer)
      serialize(message)
      port.postMessage(message)
      console.log('posted!!!')
    },
    addEventListener: (_, handler) => {
      const listener = async (data: any, ...args: any[]) => {
        console.log('adapter chrome port.addEventListener', data, ...args)
        const ports: MessagePort[] = []
        const event = new MessageEvent('message', {
          data: await deserialize(data, ports),
          ports
        })
        console.log('adapter:addEventListener', port, event, ports)

        if ('handleEvent' in handler) {
          handler.handleEvent(event)
        } else {
          console.log('executing ...')
          handler(event)
          console.log('... done')
        }
      }
      port.onMessage.addListener(listener)
      listeners.set(handler, listener)
    },
    removeEventListener: (_, handler) => {
      console.log('adapter:removeEventListener', port)
      const listener = listeners.get(handler)
      if (!listener) {
        return
      }
      port.onMessage.removeListener(listener)
      listeners.delete(handler)
    }
  }
}

export async function forward(
  messagePort: MessagePort,
  extensionPort: ResolvablePort,
  resolvePort: PortResolver = _resolvePort,
  deserializePort: PortDeserializer = _deserializePort
) {
  if (typeof extensionPort === 'string') {
    extensionPort = browser.runtime.connect(undefined, { name: extensionPort })
  }

  const port = await Promise.resolve(extensionPort).then(port => {
    console.log('create endpoint!!', extensionPort, port)
    return createEndpoint(port, resolvePort, deserializePort)
  })

  messagePort.onmessage = async ({ data, ports }) => {
    console.log(
      'forward: messagePort -> backgroundPort',
      messagePort,
      extensionPort,
      port,
      data,
      ports
    )
    port.postMessage(data, ports as any)
  }

  port.addEventListener('message', ({ data, ports }: any) => {
    console.log(
      'forward: messagePort <- backgroundPort',
      messagePort,
      extensionPort,
      port,
      data,
      ports
    )
    messagePort.postMessage(data, ports as any)
  })
}

export function isMessagePort(port: { name: string }) {
  return port.name.startsWith(SYMBOL)
}
