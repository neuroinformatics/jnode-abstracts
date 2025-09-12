import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
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
});
