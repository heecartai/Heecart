import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    // The CRM's /api routes run in the Cloudflare worker: start it with `npm run dev:api`.
    proxy: { '/api': 'http://127.0.0.1:8787' }
  }
})
