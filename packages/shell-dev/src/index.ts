import { createBridge, Bridge } from '@intlify-devtools/shared'
import { setupDevtools } from '@intlify-devtools/app-frontend'
import * as Comlink from 'comlink'
import { BService } from './BService'
import * as DevTools from './FService'

const target = document.getElementById('target') as HTMLIFrameElement
const targetWindow = target.contentWindow

// let bridge: Bridge
let bridge: Comlink.Remote<unknown>

target.src = 'target.html'
target.onload = () => {
  setupDevtools({
    connect(fn): void {
      inject(target, './build/backend.js', async () => {
        if (targetWindow) {
          // eslint-disable-next-line no-inner-declarations
          function callback(msg: string) {
            console.log('add callback', msg, window)
          }

          const bridge = Comlink.wrap<BService>(
            Comlink.windowEndpoint(targetWindow)
          )
          fn(bridge, DevTools)
          await bridge.registerDevtools(Comlink.proxy(DevTools))
          console.log(
            'add',
            await bridge.add(1, 3, Comlink.proxy(callback)),
            bridge,
            window
          )
          console.log('inject backend!', bridge)
        }
        /*
        bridge = createBridge({
          listen(fn) {
            targetWindow?.parent.addEventListener('message', evt =>
              fn(evt.data)
            )
          },
          send(data) {
            console.log('devtools -> backend', data)
            targetWindow?.postMessage(data, '*')
          }
        })
        console.log('inject backend!', bridge)
        fn(bridge)
        */
      })
    },
    onReload(fn): void {
      target.onload = () => {
        fn(bridge)
      }
    }
  })
}

function inject(target: HTMLIFrameElement, src: string, done: () => void) {
  if (!src || src === 'false') {
    return done()
  }
  if (target.contentDocument) {
    const script = target.contentDocument.createElement('script')
    script.src = src
    script.onload = done
    target.contentDocument.body.appendChild(script)
  }
}
