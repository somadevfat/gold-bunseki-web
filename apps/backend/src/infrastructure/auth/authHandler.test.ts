import { expect, describe, it, beforeAll } from "bun:test";
import { app } from "../../index";

describe("Better Auth Hono Integration", () => {
  beforeAll(() => {
    // 環境変数モック (index.ts 通過用)
    process.env.API_TOKEN = "test-session-token";
    process.env.GOOGLE_CLIENT_ID = "mock-client";
    process.env.GOOGLE_CLIENT_SECRET = "mock-secret";
  });

  it("should mount better-auth handler at /api/auth/**", async () => {
    // better-auth がキャッチするエンドポイントにリクエスト
    const res = await app.request("/api/auth/get-session");
    
    // Hono側でルートが存在しない(404)ではなく、
    // better-auth ハンドラーが処理して何らかのレスポンス（セッションなし等）を返すことを確認
    expect(res.status).not.toBe(404);

    // 通常はセッションなしとして 200 OK で null セッションを返すか、401 Unauthorized を返す
    const statusValid = res.status === 200 || res.status === 401;
    expect(statusValid).toBe(true);
  });
});
