import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import intlifyVue from '@intlify/vite-plugin-vue-i18n/lib/injection'
import path from 'path'
import { generateSecret, encrypt } from '@intlify-devtools/shared'

// @ts-ignore
const secret = generateSecret()

// https://vitejs.dev/config/
export default ({ command }) => command === 'build' ? buildConfig : serveConfig

const serveConfig = defineConfig({
  plugins: [
    vue(),
    intlifyVue({
      __INTLIFY_META__: (a1, a2) => {
        const { iv, encryptedData } = encrypt(secret, a1)
        return `${iv}$${encryptedData}`
      }
    })
  ],
  server: {
    port: 3200
  }
})

const buildConfig = defineConfig({
  publicDir: './dist',
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['es']
    }
  }
})