export * from './hook'

import { Bridge, target } from '@intlify-devtools/shared'

const hook = target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__
console.log('app back-end!')

/**
 * Setup the backend
 *
 * @param bridge - A {@link Bridge}
 */
export function setupBackend(bridge: unknown): void {
  console.log('setupBackend!')
  // TODO:
}
