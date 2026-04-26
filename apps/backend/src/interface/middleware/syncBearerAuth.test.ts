import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { syncBearerAuth } from "./syncBearerAuth";

describe("syncBearerAuth", () => {
  it("Bearer token が一致する場合に同期APIへのアクセスを許可すること", async () => {
    const app = new Hono();
    app.use("/api/v1/sync/*", syncBearerAuth("expected-token"));
    app.get("/api/v1/sync/status", (c) => c.json({ ok: true }));

    const res = await app.request("/api/v1/sync/status", {
      headers: {
        Authorization: "Bearer expected-token",
      },
    });

    expect(res.status).toBe(200);
  });

  it("Bearer token がない場合に同期APIへのアクセスを拒否すること", async () => {
    const app = new Hono();
    app.use("/api/v1/sync/*", syncBearerAuth("expected-token"));
    app.get("/api/v1/sync/status", (c) => c.json({ ok: true }));

    const res = await app.request("/api/v1/sync/status");

    expect(res.status).toBe(401);
  });
});
