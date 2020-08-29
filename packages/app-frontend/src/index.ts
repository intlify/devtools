import { Bridge, isChrome } from '@intlify-devtools/shared'
import { createApp, connectApp } from './app'

const app = createApp()
app.mount('#app')

export interface Shell {
  connect(fn: (bridge: Bridge) => void): void
  onReload(fn: (bridge?: Bridge) => void): void
}

export function setupDevtools(shell: Shell): void {
  console.log('setup Devtools!', shell)

  connectApp(app, shell)
  shell.onReload(bridge => {
    console.log('onReload!')

    if (isChrome) {
      app.config.errorHandler = undefined
    }
    bridge?.events.clear()

    connectApp(app, shell)
  })
}
