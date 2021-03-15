import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import intlify from '@intlify-devtools/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueI18n(), intlify()],
  server: {
    proxy: {
      '/frontend': {
        target: 'http://localhost:3100',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/frontend/, '/src/main.ts')
        // rewrite: (path) => path.replace(/^\/app-frontend/, '/app-frontend.es.js')
      }
    }
  }
})
