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

  it("掲示板投稿一覧APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads");
    const body = await res.json() as { threads: Array<{ title: string }> };

    expect(res.status).toBe(200);
    expect(body.threads[0].title).toBe("CPI発表前後のXAUUSDの値幅をどう見ていますか？");
  });

  it("x-test-scenario=empty で空の掲示板投稿一覧を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads", {
      headers: {
        "x-test-scenario": "empty",
      },
    });
    const body = await res.json() as { threads: unknown[] };

    expect(res.status).toBe(200);
    expect(body.threads).toEqual([]);
  });

  it("x-test-scenario=error で掲示板投稿一覧APIの500応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads", {
      headers: {
        "x-test-scenario": "error",
      },
    });

    expect(res.status).toBe(500);
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

  it("掲示板投稿作成APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "CPI発表後の反応確認",
        body: "初動とNY後半の戻りを比較したいです。",
        category: "経済指標",
      }),
    });
    const body = await res.json() as { title: string; replyCount: number };

    expect(res.status).toBe(201);
    expect(body.title).toBe("CPI発表後の反応確認");
    expect(body.replyCount).toBe(0);
  });

  it("掲示板投稿作成APIのバリデーションエラーを再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "",
        body: "",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("掲示板投稿詳細APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads/thread-1");
    const body = await res.json() as { thread: { id: string }; replies: Array<{ body: string }> };

    expect(res.status).toBe(200);
    expect(body.thread.id).toBe("thread-1");
    expect(body.replies[0].body).toContain("NY後半");
  });

  it("掲示板投稿詳細APIの404応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads/missing");

    expect(res.status).toBe(404);
  });

  it("掲示板返信作成APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads/thread-1/replies", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        body: "NY後半の戻りを見ています。",
      }),
    });
    const body = await res.json() as { threadId: string; body: string };

    expect(res.status).toBe(201);
    expect(body.threadId).toBe("thread-1");
    expect(body.body).toBe("NY後半の戻りを見ています。");
  });

  it("掲示板返信作成APIのバリデーションエラーを再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/community/threads/thread-1/replies", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        body: "",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("リサーチメモ一覧APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/research-notes");
    const body = await res.json() as { notes: Array<{ title: string }> };

    expect(res.status).toBe(200);
    expect(body.notes[0].title).toBe("CPI前後の値動き");
  });

  it("x-test-scenario=empty で空のリサーチメモ一覧を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/research-notes", {
      headers: {
        "x-test-scenario": "empty",
      },
    });
    const body = await res.json() as { notes: unknown[] };

    expect(res.status).toBe(200);
    expect(body.notes).toEqual([]);
  });

  it("リサーチメモ作成APIの正常応答を再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/research-notes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "CPI前後の値動き",
        body: "発表直後とNY後半の戻りを比較する",
      }),
    });
    const body = await res.json() as { title: string; body: string };

    expect(res.status).toBe(201);
    expect(body.title).toBe("CPI前後の値動き");
  });

  it("リサーチメモ作成APIのバリデーションエラーを再現できること", async () => {
    const res = await fetch("http://localhost:3000/api/v1/research-notes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "",
        body: "",
      }),
    });

    expect(res.status).toBe(400);
  });
});
