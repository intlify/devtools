import type { Plugin } from 'vite';
export declare type Options = {
    foo: string;
};
declare function plugin(options?: Options): Plugin;
export default plugin;
export declare const intlify: typeof plugin;
