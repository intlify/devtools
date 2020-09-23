const webpack = require('webpack')
const { merge } = require('webpack-merge')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = (config = {}) => {
  const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool:
      process.env.NODE_ENV === 'production'
        ? 'source-map'
        : 'cheap-module-eval-source-map',

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            { loader: 'cache-loader' },
            {
              loader: 'thread-loader',
              options: {
                workers: require('os').cpus().length - 1,
                poolTimeout: Infinity
              }
            },
            {
              loader: 'babel-loader'
            },
            {
              loader: 'ts-loader',
              options: {
                happyPackMode: true,
                transpileOnly: true,
                appendTsSuffixTo: [/\.vue$/]
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        },
        {
          resourceQuery: /blockType=i18n/,
          type: 'javascript/auto',
          use: [
            {
              loader: '@intlify/vue-i18n-loader'
              // options: {
              //   preCompile: true
              // }
            }
          ]
        }
      ]
    },

    plugins: [
      new VueLoaderPlugin(),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true
          }
        }
      })
    ]
  }

  return merge(base, config)
}
