import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'


// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production'
      ? '/testgame/' // prod
      : '/', // dev
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
