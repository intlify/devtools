/**
 * Message bridge, forked from the below:
 * - original repository url: https://github.com/vuejs/vue-devtools
 * - code url: https://github.com/vuejs/vue-devtools/blob/dev/packages/shared-utils/src/bridge.js
 * - author: Evan you (https://github.com/yyx990803)
 * - license: MIT
 */

import { isString, isObject, isArray } from './utils'
import {
  EventType,
  EventHandler,
  WildcardEventHandler,
  Emittable
} from './emittable'
import { createEmitter } from './emitter'

const BATCH_DURATION = 100

/**
 * Message chunk
 */
export type MessageChunk = {
  /**
   * event name
   */
  event: string
  /**
   * chunk data
   */
  chunk: string
  /**
   * wheather last message
   */
  last?: boolean
}

/**
 * Messsage payload
 */
export type MessagePayload = {
  /**
   * event name
   */
  event: string
  /**
   * message payload
   */
  payload: unknown
}

/**
 * Message data
 */
export type MessageData = string | MessageChunk | MessagePayload

/**
 * Message bridge interface
 */
export interface Bridge<Events extends Record<EventType, unknown>>
  extends Emittable<Events> {
  /**
   * Send the message
   *
   * @param event - A message event type
   * @param payload - A message event payload
   */
  send<Key extends keyof Events>(
    event: Key,
    payload: Events[keyof Events]
  ): void

  /**
   * Send the log message
   *
   * @param message - A message
   */
  log(message: string): void
}

/**
 * Message wall interface
 */
export interface Wall {
  /**
   * Listen the message event
   *
   * @param handler - A message event listen handler
   */
  listen?: (handler: EventHandler<MessageData | Array<MessageData>>) => void

  /**
   * Send the message event
   *
   * @param payload - A message event payload
   */
  send?: (payload?: MessageChunk | MessagePayload | MessagePayload[]) => void
}

function isMessageChunk(val: unknown): val is MessageChunk {
  return isObject(val) && 'chunk' in val
}

function isMessagePayload(val: unknown): val is MessagePayload {
  return isObject(val) && 'payload' in val
}

/**
 * Create a bridge
 *
 * @param wall - A {@link Wall}
 * @returns A bridge
 */
export function createBridge<Events extends Record<EventType, unknown>>(
  wall: Wall
): Bridge<Events> {
  const _emitter = createEmitter<Events>()
  let _batchingQueue: Array<MessagePayload> = []
  const _sendingQueue: Array<
    MessageChunk | MessagePayload | MessagePayload[]
  > = []
  let _receivingQueue: string[] = []
  let _sending = false
  let _time: number | null = null
  let _timer: ReturnType<typeof setTimeout> | null = null

  const bridge = {
    events: _emitter.events,

    on<Key extends keyof Events>(
      event: Key | '*',
      handler: EventHandler<Events[keyof Events] | WildcardEventHandler<Events>>
    ): void {
      _emitter.on(event, handler)
    },

    off<Key extends keyof Events>(
      event: Key | '*',
      handler: EventHandler<Events[keyof Events] | WildcardEventHandler<Events>>
    ): void {
      _emitter.off(event, handler)
    },

    emit<Key extends keyof Events>(
      event: Key | '*',
      payload?: Events[keyof Events]
    ): void {
      _emitter.emit(event, payload)
    },

    send<Key extends keyof Events>(
      event: Key,
      payload?: Events[keyof Events]
    ): void {
      if (isArray(payload)) {
        const lastIndex = payload.length - 1
        payload.forEach((chunk, index) => {
          bridge._send({
            event,
            chunk,
            last: index === lastIndex
          } as MessageChunk)
        })
      } else if (_time == null) {
        bridge._send([{ event, payload }] as MessagePayload[])
        _time = Date.now()
      } else {
        _batchingQueue.push({
          event,
          payload
        } as MessagePayload)
        const now = Date.now()
        if (now - _time > BATCH_DURATION) {
          bridge._flush()
        } else {
          _timer = setTimeout(() => bridge._flush(), BATCH_DURATION)
        }
      }
    },

    log(message: string): void {
      bridge.send('log', message as Events[keyof Events])
    },

    _flush(): void {
      if (_batchingQueue.length) {
        bridge._send(_batchingQueue)
      }
      if (_timer) {
        clearTimeout(_timer)
        _timer = null
      }
      _batchingQueue = []
      _time = null
    },

    _emit(message?: MessageData): void {
      if (isString(message)) {
        _emitter.emit(message)
      } else if (isMessageChunk(message)) {
        _receivingQueue.push(message.chunk)
        if (message.last) {
          _emitter.emit(message.event, _receivingQueue as Events[keyof Events])
          _receivingQueue = []
        }
      } else if (isMessagePayload(message)) {
        _emitter.emit(message.event, message.payload as Events[keyof Events])
      }
    },

    _send(messages: MessageChunk | MessagePayload[]): void {
      _sendingQueue.push(messages)
      bridge._nextSend()
    },

    _nextSend(): void {
      if (!_sendingQueue.length || _sending) {
        return
      }
      _sending = true
      const messages = _sendingQueue.shift()
      try {
        messages && wall.send && wall.send(messages)
      } catch (e) {
        if (
          e.message === 'Message length exceeded maximum allowed length.' &&
          messages
        ) {
          if (isMessagePayload(messages)) {
            _sendingQueue.splice(0, 0, [messages])
          } else {
            _sendingQueue.splice(0, 0, messages)
          }
        }
      }
      _sending = false
      requestAnimationFrame(() => bridge._nextSend())
    }
  }

  // emit the message to the bridge from the wall
  wall.listen &&
    wall.listen(messages => {
      isArray(messages)
        ? messages.forEach(message => bridge._emit(message))
        : bridge._emit(messages)
    })

  return bridge
}
