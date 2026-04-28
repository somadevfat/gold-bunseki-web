import { expect, it, describe, mock, beforeEach } from "bun:test";
import { getIndicators } from "./getIndicators";

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
          indicators: {
            $get: getMock,
          },
        },
      },
    },
  },
}));

describe("getIndicators", () => {
  beforeEach(() => {
    getMock.mockClear();
    requestHeaders = new Headers();
  });

  it("正常にデータを取得できた場合、JSON データを返すこと", async () => {
    /* ## Arrange ## */
    const mockResponse = { indicators: ["[USD] CPI", "[USD] ISM製造業PMI"] };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    /* ## Act ## */
    const result = await getIndicators();

    /* ## Assert ## */
    expect(getMock).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it("x-test-scenario ヘッダーがある場合、API 呼び出しへ転送すること", async () => {
    const mockResponse = { indicators: [] };
    requestHeaders = new Headers({ "x-test-scenario": "error" });
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await getIndicators();

    const init = getMock.mock.calls[0][1].init;
    expect(init.headers["x-test-scenario"]).toBe("error");
  });

  it("API 呼び出しが失敗した場合、Error をスローすること", async () => {
    /* ## Arrange ## */
    getMock.mockResolvedValue({
      ok: false,
    });

    /* ## Act & Assert ## */
    expect(getIndicators()).rejects.toThrow("指標データの取得に失敗しました");
  });
});
