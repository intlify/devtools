import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import intlifyVue from '@intlify/vite-plugin-vue-i18n/lib/injection'
import path from 'path'
import { generateSecret, encrypt } from '@intlify-devtools/shared'

// @ts-ignore
const secret = generateSecret()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n(),
    intlifyVue({
      __INTLIFY_META__: (a1, a2) => {
        const { iv, encryptedData } = encrypt(secret, a1)
        return `${iv}$${encryptedData}`
      }
    })
  ],
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
