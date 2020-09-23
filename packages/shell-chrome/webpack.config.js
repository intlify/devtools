const path = require('path')
const { config } = require('@intlify-devtools/webpack-config')

module.exports = config({
  context: __dirname,
  entry: {
    hook: './src/hook.ts',
    proxy: './src/proxy.ts',
    detector: './src/detector.ts',
    backend: './src/backend.ts',
    background: './src/background.ts',
    devtools: './src/devtools.ts',
    'devtools-background': './src/devtools-background.ts'
  },
  output: {
    path: path.resolve(__dirname, './build'),
    publicPath: '/build/',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@intlify-devtools/shared': path.resolve(__dirname, '../shared/lib'),
      '@intlify-devtools/app-frontend': path.resolve(
        __dirname,
        '../app-frontend/src'
      ),
      '@intlify-devtools/app-backend': path.resolve(
        __dirname,
        '../app-backend/src'
      ),
      vue: require.resolve('vue/dist/vue.esm-bundler.js'),
      'vue-i18n': require.resolve('vue-i18n/dist/vue-i18n.esm-bundler.js')
    }
  }
})
