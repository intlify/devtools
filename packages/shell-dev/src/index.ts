import { createBridge } from '@intlify-devtools/shared'

type Foo = {
  foo?: (msg: string) => void
}

const foo: Foo = {
  foo(msg) {
    console.log(msg)
  }
}

foo.foo?.('run shell-dev!')

const target = document.getElementById('target') as HTMLIFrameElement
const targetWindow = target.contentWindow

target.src = 'target.html'
target.onload = () => {
  inject(target, './build/backend.js', () => {
    const bridge = createBridge({
      listen(fn) {
        targetWindow?.parent.addEventListener('message', evt => fn(evt.data))
      },
      send(data) {
        console.log('devtools -> backend', data)
        targetWindow?.postMessage(data, '*')
      }
    })
    console.log('inject backend!', bridge)
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
