import { OpenAPIHono } from "@hono/zod-openapi";
import { AppContainer } from "../../app/container";
import { createMarketController } from "../controller/marketController";
import { AppVariables, Bindings } from "../types";
import * as routes from "./openapi";

type BackendApp = OpenAPIHono<{ Bindings: Bindings; Variables: AppVariables }>;

/**
 * registerMarketRoutes は Market API のルートを登録します。
 */
export function registerMarketRoutes(
  app: BackendApp,
  container: AppContainer,
): void {
  const controller = createMarketController(container);

  app.openapi(routes.latestPriceRoute, controller.getLatestPrice);
  app.openapi(routes.calculateZigZagRoute, controller.calculateZigZag);
  app.openapi(routes.marketIndicatorsRoute, controller.getIndicators);
  app.openapi(routes.marketSessionsRoute, controller.getRecentSessions);
  app.openapi(routes.eventReplayRoute, controller.getEventReplay);
}
