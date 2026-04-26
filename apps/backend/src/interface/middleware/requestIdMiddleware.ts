import type { MiddlewareHandler } from "hono";
import type { Bindings, AppVariables } from "../types";

/**
 * requestIdMiddleware はリクエスト単位の識別子を Context とレスポンスヘッダーへ設定します。
 * @responsibility ログとエラーレスポンスを同じ requestId で追跡できるようにする。
 */
export function requestIdMiddleware(): MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> {
  return async (c, next) => {
    const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
    c.set("requestId", requestId);
    c.header("x-request-id", requestId);

    await next();
  };
}
