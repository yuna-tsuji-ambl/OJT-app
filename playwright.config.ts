import { defineConfig, devices } from '@playwright/test';

const apiServerCommand = process.env.CI
  ? 'npm run build -w @ojt-app/shared && npm run build -w @ojt-app/api && npm run start -w @ojt-app/api'
  : 'npm run dev:api';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.{spec,spec.test,e2e}.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: apiServerCommand,
      port: 8080,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
