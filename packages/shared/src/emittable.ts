/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

type False = 0
type True = 1
type Boolean = True | False
type Not<T extends Boolean> = {
  0: 1
  1: 0
}[T]
// prettier-ignore
type Extends<T extends any, U extends any> = [T] extends [never]
  ? 0 // anything `never` is false
  : T extends U
    ? 1
    : 0
type Union = any
type _Exclude<T extends Union, U extends Union> = T extends U ? never : T
type Has<T extends Union, U extends Union> = Not<Extends<Exclude<U, T>, U>>

/**
 * Event type
 */
export type EventType = string | symbol

/**
 * Event handler
 */
export type EventHandler<T = unknown> = (payload?: T) => void

/**
 * Wildcad event handler
 */
export type WildcardEventHandler<T = Record<string, unknown>> = (
  event: keyof T,
  payload?: T[keyof T]
) => void

/**
 * Event handler list
 */
export type EventHandlerList<T = unknown> = Array<EventHandler<T>>

/**
 * Wildcard event handler list
 */
export type WildcardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardEventHandler<T>
>

/**
 * Event handler map
 */
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildcardEventHandlerList<Events>
>

/**
 * Event emitter interface
 */
export interface Emittable<Events extends Record<EventType, unknown>> {
  /**
   * Registered event handlers
   */
  events: EventHandlerMap<Events>

  /**
   * Register an event handler with the event type
   *
   * @param event - An event type
   * @param handler - An event handler
   */
  on<Key extends keyof Events>(
    event: Key,
    handler: EventHandler<Events[keyof Events]>
  ): void

  /**
   * Register an event handler wth all event type
   *
   * @param event - All event type
   * @param handler - An event handler
   */
  on(event: '*', handler: WildcardEventHandler<Events>): void

  /**
   * Unregister an event handler for the event type
   *
   * @param event - An event type
   * @param handler - An event handler
   */
  off<Key extends keyof Events>(
    event: Key,
    handler: EventHandler<Events[keyof Events]>
  ): void

  /**
   * Unregsiter an event handler for all event type
   *
   * @param event - All event type
   * @param handler - An event handler
   */
  off(event: '*', handler: WildcardEventHandler<Events>): void

  /**
   * Invoke all handlers with the event type
   *
   * @param event - An event type
   * @param payload - An event payload
   */
  emit<Key extends keyof Events>(
    event: Key,
    payload: Events[keyof Events]
  ): void

  /**
   * Invoke all handlers with event type
   *
   * @param event - An event type
   */
  emit<Key extends keyof Events>(
    event: Has<Events[Key], undefined> extends True ? Key : never
  ): void
}

/* eslint-enable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */
