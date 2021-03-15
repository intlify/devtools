"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intlify = void 0;
const debug_1 = require("debug");
const debug = debug_1.debug('vite-plugin-intlify-devtools');
function plugin(options = {
    devtools: 'https://unpkg.com/@intlify/devtools@next'
}) {
    debug('plugin options:', options);
    const env = process.env.NODE_ENV || 'development';
    return {
        name: 'vite-plugin-intlify-devtools',
        config(config) {
            debug('config', config);
        },
        configResolved(_config) {
            debug('configResolve', _config);
        },
        async transformIndexHtml(html, { path, filename }) {
            debug('transformIndexHtml', html, path, filename);
            if (env !== 'development') {
                return undefined;
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
            };
        },
        async transform(code, id) {
            // debug('transform', id, code)
            return {
                code
            };
        }
    };
}
// overwrite for cjs require('...')() usage
exports.default = plugin;
exports.intlify = plugin;
