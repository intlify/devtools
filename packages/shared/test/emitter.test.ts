import { createEmitter } from '../src/emitter'

test('basic', () => {
  const handler = jest.fn()

  const emitter = createEmitter<{ foo: number }>()
  emitter.on('foo', handler)
  emitter.emit('foo', 1)

  expect(handler).toBeCalledTimes(1)
  expect(handler.mock.calls[0][0]).toEqual(1)

  emitter.off('foo', handler)
  emitter.emit('foo', 1)
  expect(handler).toBeCalledTimes(1)
})

test('mlutiple reigster', () => {
  const handler1 = jest.fn()
  const handler2 = jest.fn()

  const emitter = createEmitter<{ foo: string }>()
  emitter.on('foo', handler1)
  emitter.on('foo', handler2)
  emitter.emit('foo', 'hello')

  expect(handler1).toBeCalledTimes(1)
  expect(handler1.mock.calls[0][0]).toEqual('hello')
  expect(handler2).toBeCalledTimes(1)
  expect(handler2.mock.calls[0][0]).toEqual('hello')

  emitter.off('foo', handler1)
  emitter.emit('foo', 'world')

  expect(handler1).toBeCalledTimes(1)
  expect(handler2).toBeCalledTimes(2)
  expect(handler2.mock.calls[1][0]).toEqual('world')
})

test('multiple event', () => {
  const handler1 = jest.fn()
  const handler2 = jest.fn()

  const emitter = createEmitter<{ foo: string; bar: { greeting: string } }>()
  emitter.on('foo', handler1)
  emitter.on('bar', handler2)
  emitter.emit('foo', 'hello')
  emitter.emit('bar', { greeting: 'hello' })

  expect(handler1).toBeCalledTimes(1)
  expect(handler1.mock.calls[0][0]).toEqual('hello')
  expect(handler2).toBeCalledTimes(1)
  expect(handler2.mock.calls[0][0]).toEqual({ greeting: 'hello' })

  emitter.off('foo', handler1)
  emitter.emit('foo', 'hello')
  emitter.emit('bar', { greeting: 'world' })

  expect(handler1).toBeCalledTimes(1)
  expect(handler2).toBeCalledTimes(2)
  expect(handler2.mock.calls[1][0]).toEqual({ greeting: 'world' })
})
