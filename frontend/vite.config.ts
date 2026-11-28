import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative stier: virker både på https://<bruger>.github.io/Julekalender2026/
  // og i roden af eget domæne (fridasjulekalender.dk) uden ny build.
  base: './',
  plugins: [react()],
  build: {
    // Oversæt syntaks til ældre iPhones (iOS 14+) og browsere, ikke kun Vites standard (Safari 16+).
    target: ['es2020', 'safari14', 'chrome90', 'edge90', 'firefox90'],
  },
})
