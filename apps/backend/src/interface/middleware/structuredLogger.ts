import type { MiddlewareHandler } from "hono";
import type { Bindings, AppVariables } from "../types";

export type AccessLogEntry = {
  level: "info";
  message: "http_request";
  method: string;
  path: string;
  status: number;
  durationMs: number;
  requestId?: string;
};

export type AccessLogger = (entry: AccessLogEntry) => void;

/**
 * structuredLogger はHTTPアクセスログをJSON構造で出力するミドルウェアです。
 * @responsibility method/path/status/duration/requestId を含む追跡しやすいアクセスログを記録する。
 */
export function structuredLogger(
  logger: AccessLogger = (entry) => console.info(JSON.stringify(entry)),
): MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> {
  return async (c, next) => {
    const startedAt = performance.now();

    await next();

    logger({
      level: "info",
      message: "http_request",
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - startedAt),
      requestId: c.get("requestId"),
    });
  };
}
