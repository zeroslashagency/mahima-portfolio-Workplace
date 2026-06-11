import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        emotional: resolve(__dirname, 'programs/emotional-wellness-stress-reset.html'),
        confidence: resolve(__dirname, 'programs/confidence-mindset-building.html'),
        movement: resolve(__dirname, 'programs/movement-relaxation-sessions.html'),
        nature: resolve(__dirname, 'programs/nature-based-wellness-retreats.html'),
        women: resolve(__dirname, 'programs/women-centric-wellness-circles.html'),
      },
    },
    minify: 'terser',
    cssMinify: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
