/**
 * @jest-environment jsdom
 */

import { createEmitter } from '../src/emitter'
import { createBridge, Wall } from '../src/bridge'

const dely = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

test('listen', () => {
  const igniter = createEmitter<{ fire: string }>()
  const wall: Wall = {
    listen(handler) {
      igniter.on('fire', () => {
        handler('fire')
        handler({ event: 'fire', chunk: 'chunk', last: true })
        handler({ event: 'fire', payload: 'hello' })
        handler([
          { event: 'fire', payload: 1 },
          { event: 'fire', payload: 2 },
          { event: 'fire', payload: { foo: 'foo' } }
        ])
      })
    }
  }

  const handler1 = jest.fn()
  const bridge = createBridge<{
    fire: string | string[] | number | { foo: string }
  }>(wall)
  bridge.on('fire', handler1)
  igniter.emit('fire')

  expect(handler1).toHaveBeenCalledTimes(6)
  expect(handler1.mock.calls[0][0]).toEqual(undefined)
  expect(handler1.mock.calls[1][0]).toEqual(['chunk'])
  expect(handler1.mock.calls[2][0]).toEqual('hello')
  expect(handler1.mock.calls[3][0]).toEqual(1)
  expect(handler1.mock.calls[4][0]).toEqual(2)
  expect(handler1.mock.calls[5][0]).toEqual({ foo: 'foo' })
})

test('send', () => {
  const handler1 = jest.fn()

  const wall: Wall = { send: handler1 }
  const bridge = createBridge<{ foo: string[]; bar: { value: number } }>(wall)
  bridge.send('foo', ['hello', 'world'])
  bridge.send('bar', { value: 1 })

  expect(handler1).toHaveBeenCalledTimes(3)
  expect(handler1.mock.calls[0][0]).toEqual({
    event: 'foo',
    chunk: 'hello',
    last: false
  })
  expect(handler1.mock.calls[1][0]).toEqual({
    event: 'foo',
    chunk: 'world',
    last: true
  })
  expect(handler1.mock.calls[2][0]).toEqual([
    { event: 'bar', payload: { value: 1 } }
  ])
})

test('batch sending', async () => {
  const handler1 = jest.fn()

  const wall: Wall = { send: handler1 }
  const bridge = createBridge<{ foo: string[]; bar: { value: number } }>(wall)
  bridge.send('bar', { value: 1 })
  await dely(10)
  bridge.send('bar', { value: 2 })
  bridge.send('bar', { value: 3 })
  await dely(101)

  expect(handler1).toHaveBeenCalledTimes(2)
  expect(handler1.mock.calls[0][0]).toEqual([
    { event: 'bar', payload: { value: 1 } }
  ])
  expect(handler1.mock.calls[1][0]).toEqual([
    { event: 'bar', payload: { value: 2 } },
    { event: 'bar', payload: { value: 3 } }
  ])
})

test('retransmission', async () => {
  const handler1 = jest.fn()

  let error = true
  const wall: Wall = {
    send(payload) {
      if (error) {
        throw new Error('Message length exceeded maximum allowed length.')
      }
      handler1(payload)
    }
  }
  const bridge = createBridge<{ foo: { value: number } }>(wall)
  bridge.send('foo', { value: 1 })
  error = false
  await dely(101)

  expect(handler1).toHaveBeenCalledTimes(1)
  expect(handler1.mock.calls[0][0]).toEqual([
    { event: 'foo', payload: { value: 1 } }
  ])
})
