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
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

    webServer: {
        /* start-e2e-servers.sh が モック -> Vite の順で起動することを保証する。
           Playwright自身は最終的なサービス提供口である 3001 の準備完了を待機する。 */
        command: "bash scripts/start-e2e-servers.sh",
        url: "http://127.0.0.1:3001/",
        timeout: 120 * 1000,
        /* CI環境では常に新規起動、ローカルでは再利用を許可 */
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
        stderr: "pipe",
    },
});
