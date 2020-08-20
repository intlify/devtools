/**
 * Event type
 */
export type EventType = string | symbol

/**
 * Event handler
 */
export type EventHandler<T = unknown> = (payload?: T) => void

/**
 * Event emitter interface
 */
export interface Emittable<Events extends Record<EventType, unknown>> {
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
   * Unregister an event handler with the event type
   *
   * @param event - An event type
   * @param handler - An event handler
   */
  off<Key extends keyof Events>(
    event: Key,
    handler: EventHandler<Events[keyof Events]>
  ): void

  /**
   * Invoke all handlers with the event type.
   *
   * @param event - An event type
   * @param payload - An event payload
   */
  emit<Key extends keyof Events>(
    event: Key,
    payload?: Events[keyof Events]
  ): void
}
