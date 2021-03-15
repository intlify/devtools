import { debug as Debug } from 'debug'

import type { Plugin, ResolvedConfig, UserConfig } from 'vite'

const debug = Debug('vite-plugin-intlify-devtools')

export type Options = {
  devtools?: string
}

function plugin(
  options: Options = {
    devtools: 'https://unpkg.com/@intlify/devtools@next'
  }
): Plugin {
  debug('plugin options:', options)

  const env = process.env.NODE_ENV || 'development'

  return {
    name: 'vite-plugin-intlify-devtools',

    config(config: UserConfig) {
      debug('config', config)
    },

    configResolved(_config: ResolvedConfig) {
      debug('configResolve', _config)
    },

    async transformIndexHtml(html: string, { path, filename }) {
      debug('transformIndexHtml', html, path, filename)
      if (env !== 'development') {
        return undefined
      }

      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: options.devtools
            },
            injectTo: 'head-prepend'
          }
        ]
      }
    },

    async transform(code: string, id: string) {
      // debug('transform', id, code)
      return {
        code
      }
    }
  }
}

// overwrite for cjs require('...')() usage
export default plugin
export const intlify = plugin
