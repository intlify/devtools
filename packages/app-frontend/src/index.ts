import { Bridge, isChrome } from '@intlify-devtools/shared'
import { createApp, connectApp } from './app'

const app = createApp()
app.mount('#app')

export interface Shell {
  connect(fn: (bridge: any, app: any) => void): void
  onReload(fn: (bridge?: any) => void): void
}

export function setupDevtools(shell: Shell): void {
  console.log('setup Devtools!', shell)

  connectApp(app, shell)
  shell.onReload(bridge => {
    console.log('onReload!')

    if (isChrome) {
      app.config.errorHandler = undefined
    }
    // bridge?.events.clear()

    connectApp(app, shell)
  })
}
