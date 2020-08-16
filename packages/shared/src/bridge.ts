/* eslint-disable @typescript-eslint/ban-types */

/**
 * Event name
 */
export type Event = string

/**
 * Event Message
 */
export type Message = string | string[] | { chunk: string; last: number }

export type MessageHandler = (payload: Message) => void

/**
 * Bridge
 */
export interface Bridge {
  send(event: Event, payload: Message): void
  log(message: string): void
  on(event: Event, handler: Function): void
  off(event: Event, handler: Function): void
}

/**
 * Wall
 */
export interface Wall {
  listen(fn: MessageHandler): void
  send(payload: Message): void
}

/**
 * Create a bridge
 *
 * @param wall - A {@link Wall}
 * @returns A bridge
 */
export function createBridge(wall: Wall): Bridge {
  function send(event: Event, payload: Message): void {
    // TODO:
  }

  function log(message: string): void {
    // TODO:
  }

  function on(event: Event, handler: Function): void {
    // TODO:
  }

  function off(event: Event, handler: Function): void {
    // TODO:
  }

  return {
    send,
    log,
    on,
    off
  }
}

/* eslint-enable @typescript-eslint/ban-types */
