import { beforeEach, describe, expect, it, mock } from "bun:test";
import { getSyncStatus } from "./getSyncStatus";

let requestHeaders = new Headers();
mock.module("next/headers", () => ({
  headers: () => Promise.resolve(requestHeaders),
}));

const getMock = mock();
mock.module("../../../lib/api/client", () => ({
  apiClient: {
    api: {
      v1: {
        sync: {
          status: {
            $get: getMock,
          },
        },
      },
    },
  },
}));

describe("getSyncStatus", () => {
  beforeEach(() => {
    getMock.mockClear();
    requestHeaders = new Headers();
  });

  it("正常に同期ステータスを取得できた場合、JSON データを返すこと", async () => {
    const mockResponse = {
      lastCandleAt: "2026-04-01T10:00:00Z",
      lastSessionAt: "2026-04-01",
      lastEventAt: "2026-04-01T10:00:00Z",
      totalCandles: 10000,
      syncHealth: "Healthy",
    };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getSyncStatus();

    expect(getMock).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it("x-test-scenario ヘッダーがある場合、API 呼び出しへ転送すること", async () => {
    requestHeaders = new Headers({ "x-test-scenario": "error" });
    getMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        lastCandleAt: "",
        lastSessionAt: "",
        lastEventAt: "",
        totalCandles: 0,
        syncHealth: "Unknown",
      }),
    });

    await getSyncStatus();

    const init = getMock.mock.calls[0][1].init;
    expect(init.headers["x-test-scenario"]).toBe("error");
  });

  it("API 呼び出しが失敗した場合、Error をスローすること", async () => {
    getMock.mockResolvedValue({
      ok: false,
    });

    expect(getSyncStatus()).rejects.toThrow("同期ステータスの取得に失敗しました");
  });
});
