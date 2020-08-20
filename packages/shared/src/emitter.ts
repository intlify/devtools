/**
 * Event emitter
 * - original repository url: https://github.com/developit/mitt
 * - code url: https://github.com/developit/mitt/blob/master/src/index.ts
 * - author: Jason Miller (https://github.com/developit)
 * - license: MIT
 */

import { EventType, EventHandler, Emittable } from './emittable'

type EventHandlerList<T = unknown> = Array<EventHandler<T>>
type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events,
  EventHandlerList<Events[keyof Events]>
>

/**
 * Create a event emitter
 *
 * @returns An event emitter
 */
export function createEmitter<
  Events extends Record<EventType, unknown>
>(): Emittable<Events> {
  const events = new Map() as EventHandlerMap<Events>

  return {
    on<Key extends keyof Events>(
      event: Key,
      handler: EventHandler<Events[keyof Events]>
    ): void {
      const handlers = events.get(event)
      const added = handlers && handlers.push(handler)
      if (!added) {
        events.set(event, [handler] as EventHandlerList<Events[keyof Events]>)
      }
    },

    off<Key extends keyof Events>(
      event: Key,
      handler: EventHandler<Events[keyof Events]>
    ): void {
      const handlers = events.get(event)
      if (handlers) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      }
    },

    emit<Key extends keyof Events>(
      event: Key,
      payload?: Events[keyof Events]
    ): void {
      ;((events.get(event) || []) as EventHandlerList<Events[keyof Events]>)
        .slice()
        .map(handler => handler(payload))
    }
  }
}
