import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    proxy: {
      '^/api/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
