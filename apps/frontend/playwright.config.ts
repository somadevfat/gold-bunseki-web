import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 設定ファイル
 * @responsibility E2Eテストの実行環境（サーバー起動、ブラウザ選択、タイムアウト等）を定義する。
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: "list",

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* テスト実行時にモックとフロントエンドを自動起動する（配列形式の公式推奨設定） */
  webServer: [
    {
      command: "bun run dev:mock",
      port: 8788,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "bun run dev",
      port: 3001, // urlでの疎通確認を避け、ポート開放のみで判定させることでハングを防ぐ
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_URL: "http://localhost:8788",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
