import { getResourceKeys } from '../src/index'

describe('getResourceKeys', () => {
  test('template interpolation', () => {
    const source = `<template>
  <p>{{ $t('foo.bar.buz') }}</p>
  <p>{{ t('hello') }}</p>
</template>`
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz', 'hello'])
  })

  test('javascript expression in template interpolation', () => {
    const source =
      '<template>' +
      "<p>{{ getMessage(`hello! ${$t('foo.bar.buz')}`, param1) }}</p>" +
      '</template>'
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz'])
  })

  test('html literal + template interpolation', () => {
    const source = `<template>
  <p>hello {{ t('hello', 1) }}</p>
</template>`
    expect(getResourceKeys(source)).toEqual(['hello'])
  })

  test('directive: v-text', () => {
    const source = `<template>
  <p v-text="t('hello DIO!')"></p>
</template>`
    expect(getResourceKeys(source)).toEqual(['hello DIO!'])
  })

  test('directive: v-bind', () => {
    const source = `<template>
  <p :foo="t('Hey Jonathan Joestar!')"></p>
</template>`
    expect(getResourceKeys(source)).toEqual(['Hey Jonathan Joestar!'])
  })

  test('directive: v-on', () => {
    const source = `<template>
  <p @click="onClickCall($t('Qtaro Kujo!'))"></p>
</template>`
    expect(getResourceKeys(source)).toEqual(['Qtaro Kujo!'])
  })

  test('directive: v-slot', () => {
    const source = `<template>
  <foo v-slot:foo="({ x: $t('x'), y: t('y') })">
    <p>{{ x }}: {{ y }}</p>
  </foo>
</template>`
    expect(getResourceKeys(source)).toEqual(['x', 'y'])
  })

  test('directive: v-show', () => {
    const source = `<template>
  <p v-show="isShow($tc('D4C'))"></p>
</template>`
    expect(getResourceKeys(source)).toEqual(['D4C'])
  })

  test('directive: v-if / v-else-if', () => {
    const source = `<template>
  <p v-if="isHide(foo, $t('bar'))">test</p>
  <p v-else-if="isHide(bar, $t('foo'))">test</p>
</template>`
    expect(getResourceKeys(source)).toEqual(['bar', 'foo'])
  })

  test('directive: v-for', () => {
    const source = `<template>
  <ul>
    <li v-for="(foo, index) in getKeys('ff', $t('keys'))"></li>
  </ul>
</template>`
  })

  test('custom directive: v-t', () => {
    const source = `<template>
  <p v-t="$tc('The World!')"></p>
</template>`
    expect(getResourceKeys(source)).toEqual(['The World!'])
  })

  test('script block: Option API', () => {
    const source = `<script>
export default {
  name: 'Comp',
  methods: {
    foo() {
      console.log(this.$t('foo.bar.buz'))
    }
  }
}
</script>`
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz'])
  })

  test('script block: Composition API', () => {
    const source = `<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    const ret = t('foo.bar.buz')
    return { t, message: ret, foo: t('foo') }
  }
}
</script>`
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz', 'foo'])
  })

  test('script block: Composition API with setup', () => {
    const source = `<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = t('foo.bar.buz')
</script>`
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz'])
  })

  test('script block: JSX', () => {
    // for Option API
    const sourceOptionAPI = `<script>
export default {
  name: 'Comp',
  render(h) {
    <p>{$t('hello jsx!')}</p>
  }
}
</script>`
    expect(getResourceKeys(sourceOptionAPI)).toEqual(['hello jsx!'])

    // for Composition API
    const source = `<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    return () => (
      <p>{t('hello JSX!')}</p>
    )
  }
}
</script>`
    expect(getResourceKeys(source)).toEqual(['hello JSX!'])
  })

  test('script block: TypeScript', () => {
    const source = `<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message: string = t('foo.bar.buz')
</script>`
    expect(getResourceKeys(source)).toEqual(['foo.bar.buz'])
  })
})
