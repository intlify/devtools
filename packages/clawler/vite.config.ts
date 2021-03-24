import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import intlifyVue from '@intlify/vite-plugin-vue-i18n/lib/injection'
import path from 'path'
import { generateSecret, encrypt } from '@intlify-devtools/shared'
import { config as dotEnvConfig } from 'dotenv'

const LOCAL_ENV =
  dotEnvConfig({ path: path.resolve(__dirname, './.env.local') }).parsed || {}
// @ts-ignore
const SECRET =
  LOCAL_ENV.INTLIFY_META_SECRET ||
  process.env.INTLIFY_META_SECRET ||
  generateSecret()
const BACKEND_PORT = process.env.PORT || 4000

// for vite serve
const serveConfig = defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './src/dev/frontend/locales/**')
    }),
    intlifyVue({
      __INTLIFY_META__: (a1, a2) => {
        const { iv, encryptedData } = encrypt(SECRET, a1)
        return `${iv}$${encryptedData}`
      }
    })
  ],
  server: {
    port: 3200,
    proxy: {
      '/bend': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/bend/, '/')
      }
    }
  }
})

// for vite build
const buildConfig = defineConfig({
  publicDir: './dist',
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['es']
    }
  }
})

// https://vitejs.dev/config/
export default ({ command }) =>
  command === 'build' ? buildConfig : serveConfig
