import type { RouteHandler } from "@hono/zod-openapi";
import { AppContainer } from "../../app/container";
import {
  calculateZigZagRoute,
  eventReplayRoute,
  latestPriceRoute,
  marketIndicatorsRoute,
  marketSessionsRoute,
} from "../routes/openapi";
import { Bindings, AppVariables } from "../types";

type BackendEnv = { Bindings: Bindings; Variables: AppVariables };

/**
 * createMarketController は価格・ZigZag・セッション・指標一覧・リプレイのハンドラを作成します。
 * @responsibility Market API を AppContainer の UseCase へ橋渡しする。
 */
export function createMarketController(container: AppContainer) {
  const getIndicators: RouteHandler<
    typeof marketIndicatorsRoute,
    BackendEnv
  > = async (c) => {
    try {
      const indicators =
        await container.useCases.market.getIndicators.execute(50);
      return c.json({ indicators }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Indicators Error]", error.message);
      return c.json({ indicators: [] }, 500);
    }
  };

  const getLatestPrice: RouteHandler<
    typeof latestPriceRoute,
    BackendEnv
  > = async (c) => {
    const price = await container.useCases.market.getLatestPrice.execute();
    return c.json(price, 200);
  };

  const calculateZigZag: RouteHandler<
    typeof calculateZigZagRoute,
    BackendEnv
  > = async (c) => {
    try {
      const points =
        await container.useCases.market.calculateZigZag.execute();
      return c.json({ message: "ZigZag calculate success", points }, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[ZigZag Error]", error.message);
      return c.json({ message: "Error calculating ZigZag", points: [] }, 500);
    }
  };

  const getRecentSessions: RouteHandler<
    typeof marketSessionsRoute,
    BackendEnv
  > = async (c) => {
    try {
      const { limit } = await c.req.valid("query");
      const count = parseInt(limit || "10", 10);

      const analyticsUrl =
        c.env.ANALYTICS_SERVICE_URL || "http://127.0.0.1:8000";
      const sessions =
        await container.useCases.market.getRecentSessions.execute(
          count,
          analyticsUrl,
        );

      return c.json(
        {
          sessions,
          currentCondition:
            sessions.length > 0 ? sessions[0].condition : "Small",
        },
        200,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Sessions Error]", error.message);
      return c.json({ sessions: [], currentCondition: "Unknown" }, 200);
    }
  };

  const getEventReplay: RouteHandler<
    typeof eventReplayRoute,
    BackendEnv
  > = async (c) => {
    try {
      const { event } = await c.req.valid("query");
      if (!event) return c.json({ error: "event is required" }, 400);

      const data = await container.useCases.market.getReplayData.execute(
        event,
      );
      return c.json(data, 200);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[Replay Error]", error.message);
      return c.json(
        {
          previousEvent: null,
          candles: [],
          historicalStats: [],
        },
        200,
      );
    }
  };

  return {
    getIndicators,
    getLatestPrice,
    calculateZigZag,
    getRecentSessions,
    getEventReplay,
  };
}
