
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Allow every host so LAN/mobile/demo hosts are never blocked by Vite.
    allowedHosts: true,
  },
})
