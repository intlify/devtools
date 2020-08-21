const path = require('path')

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',

  entry: {
    main: './src/index.ts',
    hook: './src/hook.ts',
    backend: './src/backend.ts'
  },
  output: {
    path: path.resolve(__dirname, './build'),
    publicPath: '/build/',
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js']
  }
})
