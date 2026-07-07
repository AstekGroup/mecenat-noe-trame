import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@make-map/types': path.resolve(__dirname, '../../shared/types/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['maplibre-gl', 'react-map-gl', 'supercluster'],
  },
})
