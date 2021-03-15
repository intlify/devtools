import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  publicDir: './dist',
  server: {
    port: 3100
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'IntlifyDevtools'
    }
    // rollupOptions: {
    //   output: [
    //     {
    //       file: 'intlify-devtools.es.js',
    //       format: 'es'
    //     },
    //     {
    //       file: 'intlify-devtools.umd.js',
    //       format: 'umd'
    //     }
    //   ]
    // }
  }
})
