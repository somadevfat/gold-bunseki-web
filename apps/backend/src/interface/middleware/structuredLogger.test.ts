import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { structuredLogger, type AccessLogEntry } from "./structuredLogger";

describe("structuredLogger", () => {
  it("リクエスト完了後に構造化されたアクセスログを出力すること", async () => {
    const entries: AccessLogEntry[] = [];
    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use("*", async (c, next) => {
      c.set("requestId", "test-request-id");
      await next();
    });
    app.use("*", structuredLogger((entry) => entries.push(entry)));
    app.get("/health", (c) => c.json({ status: "ok" }));

    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      level: "info",
      message: "http_request",
      method: "GET",
      path: "/health",
      status: 200,
      requestId: "test-request-id",
    });
    expect(entries[0].durationMs).toBeGreaterThanOrEqual(0);
  });
});
