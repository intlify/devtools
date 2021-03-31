import { traverseI18nCallExpression } from '../src/babel'

test(`t('foo.bar.buz', { name: 'foo' })`, () => {
  expect(
    traverseI18nCallExpression(`t('foo.bar.buz', { name: 'foo' })`)
  ).toEqual(['foo.bar.buz'])
})

test("getMessage(`hello! ${$t('foo.bar.buz')}`, param1)", () => {
  expect(
    traverseI18nCallExpression(
      "getMessage(`hello! ${$t('foo.bar.buz')}`, param1)"
    )
  ).toEqual(['foo.bar.buz'])
})

test(`'foo' + tc('foo.bar', 1);`, () => {
  expect(traverseI18nCallExpression(`'foo' + tc('foo.bar');`)).toEqual([
    'foo.bar'
  ])
})

test("`hello! ${$t('foo.bar.buz')}`", () => {
  expect(traverseI18nCallExpression("`hello! ${$t('foo.bar.buz')}`")).toEqual([
    'foo.bar.buz'
  ])
})

test('t(`foo.bar.buz`)', () => {
  expect(traverseI18nCallExpression('t(`foo.bar.buz`)')).toEqual([
    'foo.bar.buz'
  ])
})

test(`$t(getKey('foo'))`, () => {
  expect(traverseI18nCallExpression(`$t(getKey('foo'))`)).toEqual([])
})

test(`({ foo: t('WRRRYYYYYY!!!'), bar: $t('I refuse') })`, () => {
  expect(
    traverseI18nCallExpression(
      `({ foo: t('WRRRYYYYYY!!!'), bar: $t('I refuse') })`
    )
  ).toEqual(['WRRRYYYYYY!!!', 'I refuse'])
})

test(`this.t('foo.bar.buz')`, () => {
  expect(traverseI18nCallExpression(`this.t('foo.bar.buz')`)).toEqual([
    'foo.bar.buz'
  ])
})

test(`global.$t('foo.bar.buz')`, () => {
  expect(
    traverseI18nCallExpression(`global.$t('foo.bar.buz')`, {
      objectIdentifiers: ['global']
    })
  ).toEqual(['foo.bar.buz'])
})

test(`window['$t']('foo.bar.buz')`, () => {
  expect(
    traverseI18nCallExpression(`window['$t']('foo.bar.buz')`, {
      objectIdentifiers: ['window']
    })
  ).toEqual(['foo.bar.buz'])
})
