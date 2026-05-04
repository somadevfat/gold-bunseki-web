import { expect, describe, it, mock, beforeEach } from "bun:test";
import type { SessionVolatility } from "../../../domain/entities/session";
import { AppContainer } from "../../../app/container";
import { createMarketController } from "../marketController";
import { createMockContext } from "../../test/testHelpers";
import { Bindings } from "../../types";

interface MockResponse {
  body: Record<string, unknown> & {
    indicators?: string[];
    sessions?: unknown[];
    currentCondition?: string;
    message?: string;
    points?: unknown[];
    error?: string;
    previousEvent?: unknown;
    candles?: unknown[];
    historicalStats?: unknown[];
  };
  status: number;
}

describe("createMarketController", () => {
  const noopNext = async (): Promise<void> => {};

  let container: AppContainer;
  let indicatorsExecute: ReturnType<typeof mock>;
  let getLatestExecute: ReturnType<typeof mock>;
  let calculateZigZagExecute: ReturnType<typeof mock>;
  let getRecentSessionsExecute: ReturnType<typeof mock>;
  let getReplayExecute: ReturnType<typeof mock>;
  let batchRepoSaveAll: ReturnType<typeof mock>;
  let mockEnv: Partial<Bindings>;

  beforeEach(() => {
    indicatorsExecute = mock(() => Promise.resolve(["CPI", "雇用統計"]));
    getLatestExecute = mock(() =>
      Promise.resolve({
        timestamp: "now",
        open: 1,
        high: 2,
        low: 0,
        close: 1.5,
      }),
    );
    calculateZigZagExecute = mock(() => Promise.resolve([]));
    getRecentSessionsExecute = mock(() => Promise.resolve([]));
    getReplayExecute = mock(() =>
      Promise.resolve({
        previousEvent: null,
        candles: [],
        historicalStats: [],
      }),
    );
    batchRepoSaveAll = mock(() => Promise.resolve(true));

    container = {
      repositories: {
        batchRepo: { saveAll: batchRepoSaveAll },
      },
      useCases: {
        market: {
          getIndicators: { execute: indicatorsExecute },
          getLatestPrice: { execute: getLatestExecute },
          calculateZigZag: { execute: calculateZigZagExecute },
          getRecentSessions: { execute: getRecentSessionsExecute },
          getReplayData: { execute: getReplayExecute },
        },
      },
    } as unknown as AppContainer;

    mockEnv = {
      ANALYTICS_SERVICE_URL: "http://mock-service",
    };
  });

  describe("getIndicators", () => {
    it("指標リストを取得して 200 を返すこと", async () => {
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.getIndicators(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.indicators).toEqual(["CPI", "雇用統計"]);
    });

    it("例外発生時に 500 と空リストを返すこと", async () => {
      indicatorsExecute = mock(() => Promise.reject(new Error("DB Error")));
      container.useCases.market.getIndicators.execute = indicatorsExecute;
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.getIndicators(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.indicators).toEqual([]);
    });
  });

  describe("getLatestPrice", () => {
    it("最新価格を 200 で返すこと", async () => {
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.getLatestPrice(
        c,
        noopNext,
      )) as unknown as {
        body: { timestamp: string };
        status: number;
      };
      expect(res.status).toBe(200);
      expect(res.body.timestamp).toBe("now");
    });
  });

  describe("calculateZigZag", () => {
    it("計算に成功した場合 200 を返すこと", async () => {
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.calculateZigZag(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("ZigZag calculate success");
    });

    it("例外発生時に 500 を返すこと", async () => {
      calculateZigZagExecute = mock(() =>
        Promise.reject(new Error("Calculate Error")),
      );
      container.useCases.market.calculateZigZag.execute =
        calculateZigZagExecute;
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.calculateZigZag(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(500);
      expect(res.body.points).toEqual([]);
    });
  });

  describe("getRecentSessions", () => {
    it("データがある場合、セッション一覧を 200 で返すこと", async () => {
      const session: SessionVolatility = {
        id: 1,
        date: "2026-03-27",
        sessionName: "NY",
        startTimeJst: "09:00",
        endTimeJst: "15:00",
        volatilityPoints: 150,
        hasEvent: false,
        hasHighImpactEvent: false,
        eventsLinked: "",
        condition: "Large",
      };
      getRecentSessionsExecute = mock(() => Promise.resolve([session]));
      container.useCases.market.getRecentSessions.execute =
        getRecentSessionsExecute;

      const c = createMockContext({}, mockEnv, { limit: "5" });
      const controller = createMarketController(container);
      const res = (await controller.getRecentSessions(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(1);
      const row = res.body.sessions?.[0] as SessionVolatility;
      expect(row.condition).toBe("Large");
      expect(res.body.currentCondition).toBe("Large");
    });

    it("データが空の場合、自動同期を試行すること", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sessions: [{ condition: "Mid" }] }),
        }),
      ) as unknown as typeof globalThis.fetch;

      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      await controller.getRecentSessions(c, noopNext);

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(batchRepoSaveAll).toHaveBeenCalled();

      globalThis.fetch = originalFetch;
    });

    it("自動同期中に fetch が失敗しても安全に続行すること", async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(() =>
        Promise.reject(new Error("Fetch Error")),
      ) as unknown as typeof globalThis.fetch;

      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.getRecentSessions(
        c,
        noopNext,
      )) as unknown as MockResponse;

      expect(res.status).toBe(200);
      expect(res.body.sessions).toEqual([]);

      globalThis.fetch = originalFetch;
    });

    it("例外発生時に 200 で空の結果を返すこと (要件に基づいた挙動)", async () => {
      getRecentSessionsExecute = mock(() => {
        throw new Error("Error");
      });
      container.useCases.market.getRecentSessions.execute =
        getRecentSessionsExecute;
      const c = createMockContext({}, mockEnv);
      const controller = createMarketController(container);
      const res = (await controller.getRecentSessions(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.sessions).toEqual([]);
    });
  });

  describe("getEventReplay", () => {
    it("eventが指定されていない場合 400 を返すこと", async () => {
      const c = createMockContext({}, mockEnv, { event: "" });
      const controller = createMarketController(container);
      const res = (await controller.getEventReplay(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(400);
    });

    it("正常な指標データ取得で 200 を返すこと", async () => {
      getReplayExecute = mock(() =>
        Promise.resolve({
          previousEvent: null,
          candles: [],
          historicalStats: [],
        }),
      );
      container.useCases.market.getReplayData.execute = getReplayExecute;
      const c = createMockContext({}, mockEnv, { event: "CPI" });
      const controller = createMarketController(container);
      const res = (await controller.getEventReplay(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("candles");
      expect(res.body).toHaveProperty("historicalStats");
    });

    it("例外発生時に 200 で空の構造を返すこと", async () => {
      getReplayExecute = mock(() =>
        Promise.reject(new Error("Replay Error")),
      );
      container.useCases.market.getReplayData.execute = getReplayExecute;
      const c = createMockContext({}, mockEnv, { event: "CPI" });
      const controller = createMarketController(container);
      const res = (await controller.getEventReplay(
        c,
        noopNext,
      )) as unknown as MockResponse;
      expect(res.status).toBe(200);
      expect(res.body.previousEvent).toBeNull();
    });
  });
});
