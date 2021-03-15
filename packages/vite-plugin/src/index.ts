import { debug as Debug } from 'debug'

import type { Plugin, ResolvedConfig, UserConfig } from 'vite'

const debug = Debug('vite-plugin-intlify')

export type Options = {
  foo: string
}

function plugin(
  options: Options = {
    foo: 'test'
  }
): Plugin {
  debug('plugin options:', options)

  return {
    name: 'vite-plugin-intlify',

    config(config: UserConfig) {
      debug('config', config)
    },

    configResolved(_config: ResolvedConfig) {
      debug('configResolve', _config)
    },

    async transformIndexHtml(html: string, { path, filename, bundle, chunk }) {
      debug('transformIndexHtml', html, path, filename, bundle, chunk)
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              src: '/foo.js'
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
