const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',

  entry: {
    main: './src/index.ts',
    hook: './src/hook.ts',
    backend: './src/backend.ts',
    target: './src/target/index.ts'
  },
  output: {
    path: path.resolve(__dirname, './build'),
    publicPath: '/build/',
    filename: '[name].js'
  },

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

  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@intlify-devtools/shared': path.resolve(__dirname, '../shared/lib'),
      '@intlify-devtools/app-frontend': path.resolve(
        __dirname,
        '../app-frontend/lib'
      ),
      vue: require.resolve('vue/dist/vue.esm-bundler.js')
    }
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
})
