import { test, expect } from '@playwright/test';

test.describe('認証機能 (Authentication) E2E', () => {
  test('未ログイン状態では「GitHubでログイン」ボタンが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ログインボタンが存在することを確認
    const loginBtn = page.getByRole('button', { name: /GitHubでログイン/ });
    await expect(loginBtn).toBeVisible();
  });

  test('ログイン状態ではユーザー名と「ログアウト」ボタンが表示される', async ({ page, context }) => {
    // MSWモックにログイン状態を認識させるため、モック用 Cookie をセット
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'mock_session_token',
        domain: 'localhost',
        path: '/',
      }
    ]);

    await page.goto('/');
    
    // モックのユーザー名が表示されること
    await expect(page.getByText('Somah (Mock)')).toBeVisible();
    
    // ログアウトボタンが表示されること
    const logoutBtn = page.getByRole('button', { name: /ログアウト/ });
    await expect(logoutBtn).toBeVisible();
  });
});
