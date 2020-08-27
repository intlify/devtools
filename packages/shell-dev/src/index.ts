import { createBridge } from '@intlify-devtools/shared'
import { setupDevtools } from '@intlify-devtools/app-frontend'

const target = document.getElementById('target') as HTMLIFrameElement
const targetWindow = target.contentWindow

target.src = 'target.html'
target.onload = () => {
  setupDevtools({
    connect(fn): void {
      // TODO
      inject(target, './build/backend.js', () => {
        const bridge = createBridge({
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
      })
    },
    onReload(fn): void {
      target.onload = fn
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
