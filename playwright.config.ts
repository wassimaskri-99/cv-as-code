import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// One project per kind of test, so CI can run each group as its own job.
// `data` and `dist` need no browser; the others run against dist/ served locally.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // No retries locally. One in CI, and any test that only passes on retry
  // shows up as "flaky" in the report instead of being silently green.
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run serve',
    port: 4173,
    reuseExistingServer: !isCI,
  },
  projects: [
    { name: 'data', testDir: './tests/data' },
    { name: 'dist', testDir: './tests/dist' },
    { name: 'pdf', testDir: './tests/pdf', use: { ...devices['Desktop Chrome'] } },
    { name: 'ats', testDir: './tests/ats' },
    { name: 'e2e', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'a11y', testDir: './tests/a11y', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'responsive',
      testDir: './tests/responsive',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    // Screenshots differ between macOS and Linux, so this project runs in
    // Playwright's Docker image, both in CI and via `npm run test:visual`.
    { name: 'visual', testDir: './tests/visual', use: { ...devices['Desktop Chrome'] } },
  ],
});
