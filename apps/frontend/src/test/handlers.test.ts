import { describe, expect, it } from "bun:test";

describe("MSW abnormal scenarios", () => {
  it("x-test-scenario=error でセッションAPIの500応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/market/sessions", {
      headers: {
        "x-test-scenario": "error",
      },
    });

    expect(res.status).toBe(500);
  });

  it("x-test-scenario=empty で空のセッション一覧を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/market/sessions", {
      headers: {
        "x-test-scenario": "empty",
      },
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ sessions: [], currentCondition: "Small" });
  });
});
