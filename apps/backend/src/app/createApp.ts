import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import * as routes from "../interface/routes/openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "../infrastructure/auth/auth";
import { getAllowedOrigins } from "../infrastructure/security/origins";
import { AppContainer } from "./container";

// Middleware / Config
import { handleAppError, handleNotFound } from "../interface/http/errorResponse";
import { requestIdMiddleware } from "../interface/middleware/requestIdMiddleware";
import { structuredLogger } from "../interface/middleware/structuredLogger";
import { syncBearerAuth } from "../interface/middleware/syncBearerAuth";
import { Bindings, AppVariables } from "../interface/types";
import { registerCommunityRoutes } from "../interface/routes/communityRoutes";
import { registerMarketRoutes } from "../interface/routes/marketRoutes";
import { registerSyncRoutes } from "../interface/routes/syncRoutes";

const defaultAllowedOrigins = getAllowedOrigins();

/**
 * resolveCorsOrigin はリクエスト Origin が許可済みかを判定します。
 * @responsibility 未知の Origin に CORS 許可ヘッダーを返さない fail-closed な制御を行う。
 */
export function resolveCorsOrigin(
  origin: string | undefined,
  allowedOrigins = defaultAllowedOrigins,
): string | undefined {
  return origin && allowedOrigins.includes(origin) ? origin : undefined;
}

type CreateAppOptions = {
  apiToken: string;
  allowedOrigins?: string[];
};

/**
 * createApp は Hono アプリケーションを組み立てます。
 * @responsibility middleware、認証、OpenAPI、feature route を組み合わせて app を生成する。
 */
export function createApp(
  container: AppContainer,
  options: CreateAppOptions,
) {
  const app = new OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>();
  const allowedOrigins = options.allowedOrigins ?? defaultAllowedOrigins;

  app.use("*", secureHeaders());
  app.use("*", requestIdMiddleware());
  app.use("*", structuredLogger());

  app.use(
    "*",
    cors({
      origin: (origin) => resolveCorsOrigin(origin, allowedOrigins),
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Accept"],
      credentials: true,
    }),
  );

  app.use("/api/v1/sync/*", syncBearerAuth(options.apiToken));

  // Auth 関連 (better-auth)
  app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Gold Volatility Bunseki API",
      description: "Goldボラティリティ分析ツールのバックエンドAPI",
    },
  });
  app.get("/swagger", swaggerUI({ url: "/doc" }));

  app.openapi(routes.healthRoute, (c) =>
    c.json({ status: "ok", server: "Hono/Bun" }),
  );

  registerSyncRoutes(app, container);
  registerMarketRoutes(app, container);
  registerCommunityRoutes(app, container);

  app.notFound(handleNotFound);
  app.onError(handleAppError);

  return app;
}
