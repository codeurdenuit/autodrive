import { defineConfig } from 'vite';

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
  plugins: [],
  server: {
    port: 3000
  }
});
