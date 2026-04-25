import { describe, expect, it } from "bun:test";
import { app, resolveCorsOrigin } from "./index";

describe("security middleware", () => {
  it("許可済み Origin のみ CORS Origin として返すこと", () => {
    expect(resolveCorsOrigin("http://localhost:3001")).toBe("http://localhost:3001");
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

  it("基本的なセキュリティヘッダーを返すこと", async () => {
    const res = await app.request("/health");

    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
