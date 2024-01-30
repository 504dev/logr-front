import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.js'
    }
  },
  build: {
    chunkSizeWarningLimit: 666,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ['lodash']
        }
      }
    }
  }
})
