import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/BPV-Trader/',        // 👈 importante para GitHub Pages (project page)
  build: { outDir: 'dist' },
  server: { port: 5173 }
})
