import { describe, expect, it } from "bun:test";

describe("MSW abnormal scenarios", () => {
  it("同期ステータスAPIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/sync/status");
    const body = await res.json() as { syncHealth: string };

    expect(res.status).toBe(200);
    expect(body.syncHealth).toBe("Healthy");
  });

  it("x-test-scenario=error で同期ステータスAPIの500応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/sync/status", {
      headers: {
        "x-test-scenario": "error",
      },
    });

    expect(res.status).toBe(500);
  });

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
    const body = await res.json() as { sessions: unknown[]; currentCondition: string };

    expect(res.status).toBe(200);
    expect(body).toEqual({ sessions: [], currentCondition: "Small" });
  });

  it("セッションAPIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/market/sessions");
    const body = await res.json() as { sessions: Array<{ sessionName: string }> };

    expect(res.status).toBe(200);
    expect(body.sessions[0].sessionName).toBe("NY_Open");
  });

  it("指標一覧APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/market/indicators");
    const body = await res.json() as { indicators: string[] };

    expect(res.status).toBe(200);
    expect(body.indicators).toContain("[USD] CPI");
  });

  it("再現データAPIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/market/replay?event=CPI");
    const body = await res.json() as { previousEvent: { eventsLinked: string } };

    expect(res.status).toBe(200);
    expect(body.previousEvent.eventsLinked).toBe("CPI");
  });

  it("未ログイン時の認証セッションAPIは null を返すこと", async () => {
    const res = await fetch("http://localhost:3000/api/auth/get-session");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toBeNull();
  });

  it("ログイン済みCookieがある場合の認証セッションAPIを再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/auth/get-session", {
      headers: {
        cookie: "better-auth.session_token=mock_session_token",
      },
    });
    const body = await res.json() as { user: { name: string } };

    expect(res.status).toBe(200);
    expect(body.user.name).toBe("Somah (Mock)");
  });

  it("サインアウトAPIの成功応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/auth/sign-out", {
      method: "POST",
    });
    const body = await res.json() as { success: boolean };

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
