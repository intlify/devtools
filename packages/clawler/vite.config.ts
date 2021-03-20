import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  publicDir: './dist',
  server: {
    port: 3200
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'main.ts'),
      name: 'IntlifyClawler'
    }
  }
})
