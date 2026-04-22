import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    hmr: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5173',
        ws: true
      }
    }
  }
})
