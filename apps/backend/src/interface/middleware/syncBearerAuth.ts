import { bearerAuth } from "hono/bearer-auth";
import type { MiddlewareHandler } from "hono";
import type { Bindings, AppVariables } from "../types";

/**
 * syncBearerAuth はデータ同期APIを Bearer token で保護するミドルウェアです。
 * @responsibility Authorization ヘッダーの Bearer token を検証し、同期APIへの未認証アクセスを拒否する。
 */
export function syncBearerAuth(token: string): MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> {
  return bearerAuth({ token });
}
