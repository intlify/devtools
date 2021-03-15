import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@frontend-libs': '@intlify-devtools/frontend-libs/src/main.ts'
    }
  },
  publicDir: './dist',
  server: {
    port: 3100
  },
  build: {
    // manifest: true,
    // rollupOptions: {
    //   // overwrite default .html entry
    //   input: path.resolve(__dirname, 'src/main.ts')
    // },
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'IntlifyDevtools'
    }
  }
})
