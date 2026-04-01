import { expect, it, describe, mock, beforeEach } from "bun:test";
import { getIndicators } from "./getIndicators";

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

  it("API 呼び出しが失敗した場合、空のデフォルト値を返すこと", async () => {
    /* ## Arrange ## */
    getMock.mockResolvedValue({
      ok: false,
    });

    /* ## Act ## */
    const result = await getIndicators();

    /* ## Assert ## */
    expect(result).toEqual({ indicators: [] });
  });
});
