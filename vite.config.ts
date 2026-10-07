import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// vendor chunks by how widely they are used; a group also captures the dependencies of its packages unless a group
// with a higher priority captured them first, so React has the highest priority and everything else falls back to
// vendor-misc
const VENDOR_GROUPS: { name: string; packages: string[] }[] = [
  // the user interface used on every page
  {
    name: 'vendor-ui',
    packages: [
      'react-router',
      'react-router-dom',
      'react-router-bootstrap',
      '@reduxjs/toolkit',
      'redux',
      'react-redux',
      'react-bootstrap',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/react-fontawesome',
    ],
  },
  // large libraries of single pages
  { name: 'vendor-scheduler', packages: ['dhtmlx-scheduler'] },
  { name: 'vendor-leaflet', packages: ['leaflet', 'react-leaflet'] },
];

// matches modules of the given packages, with either path separator
const packagesPattern = (packages: string[]): RegExp =>
  new RegExp(`node_modules[\\\\/](${packages.map((p) => p.replace('/', '[\\\\/]')).join('|')})[\\\\/]`);

// https://vite.dev/config/
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
    // in kB; dhtmlx-scheduler alone is about 540 kB and cannot be split further
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: packagesPattern(['react', 'react-dom', 'scheduler']), priority: 3 },
            ...VENDOR_GROUPS.map(({ name, packages }) => ({ name, test: packagesPattern(packages), priority: 2 })),
            { name: 'vendor-misc', test: /node_modules[\\/]/, priority: 1 },
          ],
        },
      },
    },
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
