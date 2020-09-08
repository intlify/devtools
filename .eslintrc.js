module.exports = {
  root: true,
  globals: {},
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue-libs/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint'
  ],
  plugins: ['@typescript-eslint'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off'
  }
}
