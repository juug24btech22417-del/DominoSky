import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/leaflet')) return 'vendor-leaflet';
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/canvas-confetti') || id.includes('node_modules/zustand')) return 'vendor-icons';
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
