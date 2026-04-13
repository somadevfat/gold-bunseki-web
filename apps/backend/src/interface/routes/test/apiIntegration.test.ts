import { expect, describe, it, mock, beforeAll, afterAll } from "bun:test";
import { createMockDrizzle } from "../../test/testHelpers";

// DB をモックしてテスト時に実際のDB接続を発生させない
mock.module("../../../infrastructure/database/db", () => ({
  db: createMockDrizzle([]),
}));

import { app } from "../../../index";

/**
 * API Response Integrity Tests (Integration)
 * @responsibility: エンドポイントが期待通りのレスポンス形式（キャメルケース）とステータスコードを返し、仕様を満たしていることを証明する。
 * @logic: Hono の app.request を使用し、PostgreSQL (Drizzle) をモックした環境でリクエストを実行する。
 */
describe("API Response Integrity Tests (Integration)", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("fetch failed (mock)")),
    ) as unknown as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  // 注: index.ts の DI ミドルウェアで db シングルトンが直接使われているため、
  // 完全に分離したインテグレーションテストにするには、本来は DI を差し替え可能にする必要がある。
  // 現状はコントローラーのテストで十分カバーされているが、
  // ここでは最低限の不整合を解消するためにダミーの環境変数を渡す。
  const mockEnv = {
    DATABASE_URL: "postgresql://mock:mock@localhost:5432/mock",
    ANALYTICS_SERVICE_URL: "http://mock-service",
  };

  // ==========================================
  // ① 正常系 (Normal Cases)
  // ==========================================
  describe("Normal Cases (正常系)", () => {
    it("GET /health: ヘルスチェックが 200 を返すこと", async () => {
      const res = await app.request("/health", {}, mockEnv);
      expect(res.status).toBe(200);
      const body = (await res.json()) as { status: string };
      expect(body.status).toBe("ok");
    });

    it("GET /api/v1/market/sessions: 直近のセッション一覧を正しい形式で取得できること", async () => {
      // ## Act ##
      const res = await app.request(
        "/api/v1/market/sessions?limit=5",
        {},
        mockEnv,
      );

      // ## Assert ##
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        sessions: unknown[];
        currentCondition: string;
      };
      expect(body.sessions).toBeInstanceOf(Array);
      expect(body.currentCondition).toBeDefined();
    });

    it("GET /api/v1/sync/status: 同期状況が返却されること", async () => {
      // ## Act ##
      const res = await app.request(
        "/api/v1/sync/status",
        { headers: { Authorization: "Bearer ci-test-token" } },
        mockEnv,
      );

      // ## Assert ##
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        lastCandleAt: string;
        syncHealth: string;
      };
      expect(body.lastCandleAt).toBeDefined();
      expect(body.syncHealth).toBeDefined();
    });
  });

  // ==========================================
  // ② 異常系 & 境界値 (Abnormal & Boundary Cases)
  // ==========================================
  describe("Abnormal & Boundary Cases (異常・境界値)", () => {
    it("GET /api/v1/market/sessions: 不正な型(limit=abc)の指定時でも 200 を返し、ハンドリングされること", async () => {
      // ## Act ##
      const res = await app.request(
        "/api/v1/market/sessions?limit=abc",
        {},
        mockEnv,
      );

      // ## Assert ##
      expect(res.status).toBe(200);
    });

    it("GET /api/v1/market/sessions: 極端に大きな limit を指定しても安全に動作すること", async () => {
      // ## Act ##
      const res = await app.request(
        "/api/v1/market/sessions?limit=999999",
        {},
        mockEnv,
      );

      // ## Assert ##
      expect(res.status).toBe(200);
    });

    it("GET /api/v1/market/replay: eventパラメータが未指定の場合 400 エラーを返すこと", async () => {
      // ## Act ##
      const res = await app.request("/api/v1/market/replay", {}, mockEnv);

      // ## Assert ##
      expect(res.status).toBe(400);
    });
  });
});
