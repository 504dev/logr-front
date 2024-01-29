import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue2'

export default {
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
  }
}
