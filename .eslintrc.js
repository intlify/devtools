'use strict'

module.exports = {
  root: true,
  globals: {
    page: true,
    browser: true,
    context: true
  },
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue-libs/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    'object-curly-spacing': 'off',
    'vue/valid-template-root': 'off',
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/ban-ts-comment': 'off'
  }
}
