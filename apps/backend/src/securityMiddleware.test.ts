import { describe, expect, it } from "bun:test";
import { app, resolveCorsOrigin } from "./index";

describe("security middleware", () => {
  it("許可済み Origin のみ CORS Origin として返すこと", () => {
    expect(resolveCorsOrigin("http://localhost:3001")).toBe("http://localhost:3001");
    expect(resolveCorsOrigin("https://fanda-dev.com")).toBe("https://fanda-dev.com");
    expect(resolveCorsOrigin("http://localhost:5173")).toBeUndefined();
    expect(resolveCorsOrigin(undefined)).toBeUndefined();
  });

  it("未知の Origin には CORS 許可ヘッダーを返さないこと", async () => {
    const res = await app.request("/health", {
      headers: {
        Origin: "http://localhost:5173",
      },
    });

    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("本番フロントから認証APIへの preflight を許可すること", async () => {
    const res = await app.request("/api/auth/sign-in/social", {
      method: "OPTIONS",
      headers: {
        Origin: "https://fanda-dev.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

    expect(res.headers.get("access-control-allow-origin")).toBe("https://fanda-dev.com");
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("基本的なセキュリティヘッダーを返すこと", async () => {
    const res = await app.request("/health");

    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
