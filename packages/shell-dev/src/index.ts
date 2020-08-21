type Foo = {
  foo?: (msg: string) => void
}

const foo: Foo = {
  foo(msg) {
    console.log(msg)
  }
}

foo.foo && foo.foo('run shell-dev!')

const target = document.getElementById('target') as HTMLIFrameElement
target.src = 'target.html'
target.onload = () => {
  inject(target, './build/backend.js', () => {
    console.log('inject backend!')
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
