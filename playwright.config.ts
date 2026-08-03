import { defineConfig, devices } from '@playwright/test';

// Firestore Emulator の既定ポート（8081）と競合しないよう E2E API は別ポートを使う
const e2eApiPort = process.env.E2E_API_PORT ?? '8091';
const apiProxyTarget = `http://localhost:${e2eApiPort}`;
const apiServerCommand =
  'npm run build -w @ojt-app/shared && npm run build -w @ojt-app/api && npm run start -w @ojt-app/api';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.{spec,spec.test,e2e}.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // ネスト Vitest（CI ゲート）と API 負荷でフレークしやすいため既定は 1
  workers: 1,
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
      url: `${apiProxyTarget}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: e2eApiPort,
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        API_PROXY_TARGET: apiProxyTarget,
      },
    },
  ],
});
