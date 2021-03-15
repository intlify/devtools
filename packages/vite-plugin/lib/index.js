"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intlify = void 0;
const debug_1 = require("debug");
const debug = debug_1.debug('vite-plugin-intlify');
function plugin(options = {
    foo: 'test'
}) {
    debug('plugin options:', options);
    return {
        name: 'vite-plugin-intlify',
        config(config) {
            debug('config', config);
        },
        configResolved(_config) {
            debug('configResolve', _config);
        },
        async transformIndexHtml(html, { path, filename, bundle, chunk }) {
            debug('transformIndexHtml', html, path, filename, bundle, chunk);
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
