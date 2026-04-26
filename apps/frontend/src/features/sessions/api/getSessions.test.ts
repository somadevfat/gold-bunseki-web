import { expect, it, describe, mock, beforeEach } from "bun:test";
import { getSessions } from "./getSessions";

/* next/headers のモック化 */
let requestHeaders = new Headers();
mock.module("next/headers", () => ({
  headers: () => Promise.resolve(requestHeaders),
}));

/* apiClient のモック化 */
const getMock = mock();
mock.module("../../../lib/api/client", () => ({
  apiClient: {
    api: {
      v1: {
        market: {
          sessions: {
            $get: getMock,
          },
        },
      },
    },
  },
}));

describe("getSessions", () => {
  beforeEach(() => {
    getMock.mockClear();
    requestHeaders = new Headers();
  });

  it("正常にデータを取得できた場合、JSON データを返すこと", async () => {
    /* ## Arrange ## */
    const mockResponse = { sessions: [], currentCondition: "Large" };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    /* ## Act ## */
    const result = await getSessions(5);

    /* ## Assert ## */
    expect(getMock).toHaveBeenCalled();
    expect(getMock.mock.calls[0][0].query.limit).toBe("5");
    expect(result).toEqual(mockResponse);
  });

  it("x-test-scenario ヘッダーがある場合、API 呼び出しへ転送すること", async () => {
    const mockResponse = { sessions: [], currentCondition: "Small" };
    requestHeaders = new Headers({ "x-test-scenario": "empty" });
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await getSessions(3);

    const init = getMock.mock.calls[0][1].init;
    expect(init.headers["x-test-scenario"]).toBe("empty");
  });

  it("API 呼び出しが失敗した場合、Error をスローすること", async () => {
    /* ## Arrange ## */
    getMock.mockResolvedValue({
      ok: false,
    });

    /* ## Act & Assert ## */
    expect(getSessions()).rejects.toThrow("セッションデータの取得に失敗しました");
  });
});
