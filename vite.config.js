import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue2'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          whitespace: 'preserve'
        }
      }
    }),
    eslint()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.min.js'
    }
  },
  build: {
    chunkSizeWarningLimit: 666,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       lodash: ['lodash']
    //     }
    //   }
    // }
  }
})
