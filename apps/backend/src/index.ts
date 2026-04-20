import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import * as routes from "./interface/routes/openapi";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";

// Middleware / Config
import { diMiddleware } from "./interface/middleware/diMiddleware";
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

// 1. グローバル設定 (CORS)
const defaultOrigins = [
  "http://localhost:3001",
  "https://gold-vola-frontend.somahiranodev.workers.dev",
  "https://fanda-dev.com",
  "https://www.fanda-dev.com",
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : defaultOrigins;

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  }),
);

// 2. DI ミドルウェア (依存オブジェクトの注入)
app.use("*", diMiddleware());

// 2.5 APIキー認証 (データ同期APIの保護)
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

app.use("/api/v1/sync/*", bearerAuth({ token: apiToken }));

// 2.8 Auth 関連 (better-auth)
import { auth } from "./infrastructure/auth/auth";
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

/* Bun.serve でHTTPサーバーを起動 (Docker/VPS環境用) */
const port = parseInt(process.env.PORT ?? "3000", 10);

export { app };

export default {
  port,
  fetch: app.fetch,
};
