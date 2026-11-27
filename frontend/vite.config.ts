import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serverer appen fra https://<bruger>.github.io/Julekalender2026/
  base: '/Julekalender2026/',
  plugins: [react()],
  build: {
    // Oversæt syntaks til ældre iPhones (iOS 14+) og browsere, ikke kun Vites standard (Safari 16+).
    target: ['es2020', 'safari14', 'chrome90', 'edge90', 'firefox90'],
  },
})
