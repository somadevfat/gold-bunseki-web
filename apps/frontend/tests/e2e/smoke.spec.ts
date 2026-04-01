import { test, expect } from '@playwright/test';

/**
 * Gold Volatility Analyzer - E2E Test (Mock Server)
 * @responsibility Hono による外部モックサーバーを用いて、アプリの全機能が統合動作することを保証する。
 */
test.describe('Dashboard E2E (Mock Server)', () => {
  
  test.beforeEach(async ({ page }) => {
    // ページへ移動 (NEXT_PUBLIC_API_URL が 8788 を向いている)
    await page.goto('/');
    // ネットワークが落ち着くまで待機
    await page.waitForLoadState('networkidle');
  });

  test('初期表示でモックサーバーからのセッションデータが表示されること', async ({ page }) => {
    const timeline = page.locator('section').filter({ hasText: 'Session Fact Timeline' });
    
    // モックサーバーが返す "NY_Open" を確認
    await expect(timeline.getByText('NY_Open').first()).toBeVisible();

    // モックサーバーが返す金額 "$120.5" を確認
    await expect(timeline.getByText('$120.5')).toBeVisible();
  });

  test('指標を切り替えた際、モックサーバーからのチャートデータと統計が表示されること', async ({ page }) => {
    /* ## Act ## */
    // "CPI" ボタンをクリック
    await page.getByRole('button', { name: 'CPI', exact: true }).click();

    /* ## Assert ## */
    // 1. チャートエリアの見出しを確認 (ISMからCPIに変わるのを待つ)
    const chartArea = page.locator('section').filter({ hasText: 'Market Event Context' });
    
    // 見出しテキストが "CPI" を含むようになるまで待機（これにより RSC の更新完了を保証）
    await expect(chartArea.locator('h3')).toContainText('CPI', { timeout: 15000 });

    // 2. モックサーバーが返す Previous Date ("2026年3月1日") を確認
    await expect(page.getByText('2026年3月1日')).toBeVisible();

    // 3. モックサーバーが返す統計平均 ("$140.5") を確認
    await expect(page.getByText('$140.5')).toBeVisible();

    // 4. チャートコンテナの存在を確認
    await expect(page.locator('.tv-lightweight-charts')).toBeVisible();
  });
});
