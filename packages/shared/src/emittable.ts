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
    event: Key | '*',
    handler: EventHandler<Events[keyof Events]> | WildcardEventHandler<Events>
  ): void

  /**
   * Register an event handler wth all event type
   *
   * @param event - All event type
   * @param handler - An event handler
   */
  // on(event: '*', handler: WildcardEventHandler<Events>): void

  /**
   * Unregister an event handler for the event type
   *
   * @param event - An event type
   * @param handler - An event handler
   */
  off<Key extends keyof Events>(
    event: Key | '*',
    handler: EventHandler<Events[keyof Events]> | WildcardEventHandler<Events>
  ): void

  /**
   * Unregsiter an event handler for all event type
   *
   * @param event - All event type
   * @param handler - An event handler
   */
  // off(event: '*', handler: WildcardEventHandler<Events>): void

  /**
   * Invoke all handlers with the event type
   *
   * @param event - An event type
   * @param payload - An event payload, optional
   */
  emit<Key extends keyof Events>(
    event: Key | '*',
    payload?: Events[keyof Events]
  ): void
}
