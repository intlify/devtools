/* eslint-disable @typescript-eslint/ban-types */

export interface Emitter {
  on(event: string, handler: Function): void
}

export function createEmitter(): Emitter {
  function on(event: string, handler: Function): void {
    // TODO:
  }
  return { on }
}

/* eslint-enable @typescript-eslint/ban-types */
