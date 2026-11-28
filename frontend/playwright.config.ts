import { defineConfig, devices } from '@playwright/test'

// Tester produktionsbuildet (samme kode som på GitHub Pages) i desktop- og iPhone-browsere.
// iPhone-projekterne bruger WebKit, samme motor som Safari og alle andre browsere på iOS.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  outputDir: './tmp/playwright-results',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    timezoneId: 'Europe/Copenhagen',
    locale: 'da-DK',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'iPhone 13', use: { ...devices['iPhone 13'] } },
    { name: 'iPhone SE', use: { ...devices['iPhone SE'] } },
    // Samme skærm (320 px) i Chromium: måler layoutbredden korrekt, også på Windows med skalering.
    { name: 'iPhone SE layout (Chromium)', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
