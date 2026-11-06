import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e setup.
 * - **What:** runs the browser tests in `e2e/` against `ng serve` (4200) and the mock API (3000).
 * - **Why:** both servers start on demand and are reused when already running, so `npm run e2e` works from a cold start and next to a dev session.
 * - **Why one worker:** the mock API keeps its data in memory; tests create their own data, but one worker keeps its 0.2-2.2 s latency from piling up.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm --prefix server start',
      url: 'http://localhost:3000/api-docs/',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
});
