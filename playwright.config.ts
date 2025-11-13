import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* テストのタイムアウト設定 */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  /* 並列実行の設定 */
  fullyParallel: true,

  /* CIでのみfail fast */
  forbidOnly: !!process.env.CI,

  /* CI環境でのリトライ設定 */
  retries: process.env.CI ? 2 : 0,

  /* 並列実行数 */
  workers: process.env.CI ? 1 : undefined,

  /* レポーター設定 */
  reporter: 'html',

  /* すべてのテストで共有する設定 */
  use: {
    /* ベースURL */
    baseURL: 'http://localhost:3000',

    /* テスト失敗時のトレース収集 */
    trace: 'on-first-retry',

    /* スクリーンショット設定 */
    screenshot: 'only-on-failure',
  },

  /* テスト実行前にViteサーバーを起動 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* ブラウザ設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
