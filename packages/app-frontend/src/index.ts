import { Bridge } from '@intlify-devtools/shared'

export interface Shell {
  connect(fn: (bridge: Bridge) => void): void
  onReload(fn: () => void): void
}
export function setupDevtools(shell: Shell): void {
  // TODO:
  console.log('setup Devtools!', shell)
}
