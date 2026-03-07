import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../apps/web/src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      'next/link': path.resolve(__dirname, './src/adapters/next-link.tsx'),
      'next/image': path.resolve(__dirname, './src/adapters/next-image.tsx'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
