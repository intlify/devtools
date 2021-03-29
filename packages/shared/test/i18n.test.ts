import { getResourceKeys } from '../src/index'

describe('getResourceKeys', () => {
  test('text', () => {
    const source = `<template>
  <p>{{ $t('foo.bar.buz') }}</p>
  <p>{{ t('hello') }}</p>
</template>`
    expect(getResourceKeys(source)).toEqual([
      'foo.bar.buz',
      'hello'
    ])
  })

  test('literal + text', () => {
    const source = `<template>
  <p>hello {{ t('hello', 1) }}</p>
</template>`
    expect(getResourceKeys(source)).toEqual([
      'foo.bar.buz',
      'hello'
    ])
  })

  test.skip('javascript expression')
  test.skip('directive: v-text')
  test.skip('directive: v-bind')
  test.skip('directive: v-on')
  test.skip('directive: v-for')
  test.skip('custom directive: v-t')
})
