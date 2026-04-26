import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handleAppError, handleNotFound } from "./errorResponse";

describe("errorResponse", () => {
  it("未定義ルートを標準化された404レスポンスに変換すること", async () => {
    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use("*", async (c, next) => {
      c.set("requestId", "test-request-id");
      await next();
    });
    app.notFound(handleNotFound);

    const res = await app.request("/missing");
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toMatchObject({
      title: "Not Found",
      status: 404,
      instance: "/missing",
      requestId: "test-request-id",
    });
  });

  it("HTTPExceptionをステータス付きの標準化レスポンスに変換すること", async () => {
    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use("*", async (c, next) => {
      c.set("requestId", "test-request-id");
      await next();
    });
    app.get("/error", () => {
      throw new HTTPException(401, { message: "Unauthorized" });
    });
    app.onError(handleAppError);

    const res = await app.request("/error");
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toMatchObject({
      title: "Unauthorized",
      status: 401,
      detail: "Unauthorized",
      requestId: "test-request-id",
    });
  });
});
