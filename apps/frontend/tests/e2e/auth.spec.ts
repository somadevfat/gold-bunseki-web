import { test, expect } from '@playwright/test';

test.describe('認証機能 (Authentication) E2E', () => {
  test('未ログイン状態では「Googleでログイン」ボタンが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ログインボタンが存在することを確認
    const loginBtn = page.getByRole('button', { name: /Google でログイン/ });
    await expect(loginBtn).toBeVisible();
  });

  test('「Googleでログイン」ボタンをクリックすると、適切な認証APIが呼び出されること', async ({ page }) => {
    await page.goto('/');
    
    // モックサーバーへの送信としてインターセプトするか、リクエスト送信自体を検知する
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/auth/sign-in/social') && request.method() === 'POST'
    );
    
    // ボタンをクリック
    await page.getByRole('button', { name: /Google でログイン/ }).click();
    
    // API呼び出しが正しく行われたことを確認
    const request = await requestPromise;
    const postData = request.postDataJSON();
    expect(postData.provider).toBe('google');
  });

  test('ログイン状態ではユーザー名と「ログアウト」ボタンが表示される', async ({ page, context }) => {
    // MSWモックにログイン状態を認識させるため、モック用 Cookie をセット
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'mock_session_token',
        domain: '127.0.0.1',
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
