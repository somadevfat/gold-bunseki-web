import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import * as routes from "./interface/routes/openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./infrastructure/auth/auth";
import { getAllowedOrigins } from "./infrastructure/security/origins";

// Middleware / Config
import { diMiddleware } from "./interface/middleware/diMiddleware";
import { handleAppError, handleNotFound } from "./interface/http/errorResponse";
import { requestIdMiddleware } from "./interface/middleware/requestIdMiddleware";
import { structuredLogger } from "./interface/middleware/structuredLogger";
import { syncBearerAuth } from "./interface/middleware/syncBearerAuth";
import { Bindings, AppVariables } from "./interface/types";

// Controllers
import { MarketController } from "./interface/controller/marketController";
import { SyncController } from "./interface/controller/syncController";

/**
 * Gold Volatility Bunseki API (Hono / Bun.serve)
 * @responsibility: アプリケーションのエントリポイント。各コンポーネントを組み立て、APIを起動する。
 */

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>();

export type AppType = typeof app;

// 1. グローバル設定 (Security Headers / CORS)
const allowedOrigins = getAllowedOrigins();

/**
 * resolveCorsOrigin はリクエスト Origin が許可済みかを判定します。
 * @responsibility 未知の Origin に CORS 許可ヘッダーを返さない fail-closed な制御を行う。
 */
export function resolveCorsOrigin(origin: string | undefined): string | undefined {
  return origin && allowedOrigins.includes(origin) ? origin : undefined;
}

app.use("*", secureHeaders());
app.use("*", requestIdMiddleware());
app.use("*", structuredLogger());

app.use(
  "*",
  cors({
    origin: (origin) => resolveCorsOrigin(origin),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  }),
);

// 2. DI ミドルウェア (依存オブジェクトの注入)
app.use("*", diMiddleware());

// 2.5 APIキー認証 (データ同期APIの保護)
/**
 * validateStartupEnv はAPI起動に必要な環境変数を検証する関数です。
 * @responsibility APIトークン未設定のまま同期APIを公開しないよう起動を停止する。
 */
export function validateStartupEnv(): void {
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    console.error("💣 FATAL ERROR: API_TOKEN environment variable is not set.");
    console.error(
      "Please set API_TOKEN in your environment (e.g. .env) to secure the API.",
    );
    process.exit(1);
  }
}
validateStartupEnv();
const apiToken = process.env.API_TOKEN as string;

app.use("/api/v1/sync/*", syncBearerAuth(apiToken));

// 2.8 Auth 関連 (better-auth)
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// 3. OpenAPI / Swagger 設定
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Gold Volatility Bunseki API",
    description: "Goldボラティリティ分析ツールのバックエンドAPI",
  },
});
app.get("/swagger", swaggerUI({ url: "/doc" }));

// 4. ルーティングの登録
// ==========================================

// Health Check
app.openapi(routes.healthRoute, (c) =>
  c.json({ status: "ok", server: "Hono/Bun" }),
);

// Sync Status & Operations
app.openapi(routes.syncStatusRoute, SyncController.getSyncStatus);

app.openapi(routes.syncDataRoute, SyncController.receiveSyncData);
app.openapi(routes.syncSeedRoute, SyncController.receiveSeedData);

// Market Data (Price, ZigZag, Sessions)
app.openapi(routes.latestPriceRoute, MarketController.getLatestPrice);
app.openapi(routes.calculateZigZagRoute, MarketController.calculateZigZag);
app.openapi(routes.marketSessionsRoute, MarketController.getRecentSessions);
app.openapi(routes.eventReplayRoute, MarketController.getEventReplay);
app.openapi(routes.marketIndicatorsRoute, MarketController.getIndicators);

app.notFound(handleNotFound);
app.onError(handleAppError);

/* Bun.serve でHTTPサーバーを起動 (Docker/VPS環境用) */
const port = parseInt(process.env.PORT ?? "3000", 10);

export { app };

export default {
  port,
  fetch: app.fetch,
};
