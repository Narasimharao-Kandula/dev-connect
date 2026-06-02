import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts') || id.includes('@tanstack/react-table')) return 'vendor-chart';
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('lottie-react')) return 'vendor-ui';
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) return 'vendor-form';
            if (id.includes('zustand')) return 'vendor-state';
            if (id.includes('cmdk') || id.includes('axios') || id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) return 'vendor-utils';
            if (id.includes('react-router-dom') || id.includes('socket.io-client')) return 'vendor-net';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
          }
        },
      },
    },
  },
})
