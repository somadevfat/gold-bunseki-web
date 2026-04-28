import { beforeEach, describe, expect, it, mock } from "bun:test";
import { getCommunityThreads } from "./getCommunityThreads";

let requestHeaders = new Headers();
mock.module("next/headers", () => ({
  headers: () => Promise.resolve(requestHeaders),
}));

const getMock = mock();
mock.module("@/lib/api/client", () => ({
  apiClient: {
    api: {
      v1: {
        community: {
          threads: {
            $get: getMock,
          },
        },
      },
    },
  },
}));

describe("getCommunityThreads", () => {
  beforeEach(() => {
    getMock.mockClear();
    requestHeaders = new Headers();
  });

  it("正常に掲示板投稿一覧を取得できた場合、JSONデータを返すこと", async () => {
    /* ## Arrange ## */
    const mockResponse = {
      threads: [
        {
          id: "thread-1",
          title: "CPI発表前後のXAUUSDの値幅をどう見ていますか？",
          category: "Market Discussion",
          excerpt: "前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。",
          replyCount: 12,
          createdAt: "2026-04-01T12:00:00Z",
        },
      ],
    };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    /* ## Act ## */
    const result = await getCommunityThreads();

    /* ## Assert ## */
    expect(getMock).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it("x-test-scenario ヘッダーがある場合、API呼び出しへ転送すること", async () => {
    /* ## Arrange ## */
    requestHeaders = new Headers({ "x-test-scenario": "empty" });
    getMock.mockResolvedValue({
      ok: true,
      json: async () => ({ threads: [] }),
    });

    /* ## Act ## */
    await getCommunityThreads();

    /* ## Assert ## */
    const init = getMock.mock.calls[0][1].init;
    expect(init.headers["x-test-scenario"]).toBe("empty");
  });

  it("API呼び出しが失敗した場合、Errorをスローすること", async () => {
    /* ## Arrange ## */
    getMock.mockResolvedValue({
      ok: false,
    });

    /* ## Act & Assert ## */
    expect(getCommunityThreads()).rejects.toThrow("掲示板投稿の取得に失敗しました");
  });
});
