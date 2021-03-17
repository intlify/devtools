import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import intlifyVue from '@intlify/vite-plugin-vue-i18n/lib/injection'
import intlify from 'vite-plugin-intlify-devtools'
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
    }),
    intlify({
      devtools: 'http://localhost:3000/frontend'
    })
  ],
  server: {
    proxy: {
      '/frontend': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/frontend/, '/src/main.ts')
        rewrite: path => path.replace(/^\/frontend/, '/devtools.es.js')
      }
    }
  }
})
