import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serverer appen fra https://<bruger>.github.io/Julekalender2026/
  base: '/Julekalender2026/',
  plugins: [react()],
})
