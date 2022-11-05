import { defineConfig } from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  root: './src',
  publicDir: '../static',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {},
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  plugins: [svelte()],
  server: {
    port: 3000
  }
});
