type Foo = {
  foo?: (msg: string) => void
}

const foo: Foo = {
  foo(msg) {
    console.log(msg)
  }
}

foo.foo?.('foo devtools!')
