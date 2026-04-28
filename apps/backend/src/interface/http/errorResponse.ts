import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId?: string;
};

/**
 * createProblemDetails は API エラーを RFC 7807 風のJSON形式へ正規化します。
 * @responsibility 例外・404応答をフロントエンドが一貫して扱えるエラー形式に変換する。
 */
export function createProblemDetails(
  status: number,
  title: string,
  detail: string,
  instance: string,
  requestId?: string,
): ProblemDetails {
  return {
    type: `https://httpstatuses.com/${status}`,
    title,
    status,
    detail,
    instance,
    ...(requestId ? { requestId } : {}),
  };
}

/**
 * handleNotFound は未定義ルートへのレスポンスを生成します。
 * @responsibility 404時も標準化されたエラーレスポンスを返す。
 */
export function handleNotFound(c: Context) {
  const requestId = c.get("requestId");

  return c.json(
    createProblemDetails(404, "Not Found", "The requested resource was not found.", c.req.path, requestId),
    404,
  );
}

/**
 * handleAppError はアプリケーション内で発生した例外をHTTPレスポンスへ変換します。
 * @responsibility 未捕捉例外やHTTPExceptionを標準化されたJSONエラーとして返す。
 */
export function handleAppError(err: Error, c: Context) {
  const status = err instanceof HTTPException ? err.status : 500;
  const title = status === 500 ? "Internal Server Error" : "Application Error";
  const detail = status === 500 ? "Internal Server Error" : err.message;
  const requestId = c.get("requestId");

  console.error(
    JSON.stringify({
      level: "error",
      message: err.message,
      status,
      path: c.req.path,
      method: c.req.method,
      requestId,
    }),
  );

  return c.json(createProblemDetails(status, title, detail, c.req.path, requestId), status);
}
