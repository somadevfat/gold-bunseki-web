import { test, expect } from '@playwright/test';

/**
 * 異常系・境界値テスト (Error Handling & Edge Cases)
 * @responsibility モックサーバーのシナリオ切り替え機能を利用し、アプリがエラーやデータ不在に耐えられるか検証する。
 */
test.describe('Error Handling & Edge Cases', () => {

  test('セッションデータが空の場合、適切な案内メッセージが表示されること', async ({ page, context }) => {
    // リクエストヘッダーに 'empty' シナリオをセット
    await context.setExtraHTTPHeaders({
      'x-test-scenario': 'empty'
    });

    await page.goto('/');
    
    // 特定のメッセージが表示されることを確認
    await expect(page.getByText('データが見つかりませんでした。')).toBeVisible();
  });

  test('APIが500エラーを返した場合、Error Boundaryが正常に表示されること', async ({ page, context }) => {
    // リクエストヘッダーに 'error' シナリオをセット
    await context.setExtraHTTPHeaders({
      'x-test-scenario': 'error'
    });

    await page.goto('/');

    // カスタムエラー画面のテキストを確認
    await expect(page.getByText('問題が発生しました')).toBeVisible();
    await expect(page.getByRole('button', { name: '再読み込み' })).toBeVisible();
  });
});
