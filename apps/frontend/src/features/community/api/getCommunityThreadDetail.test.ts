import { beforeEach, describe, expect, it, mock } from "bun:test";
import { getCommunityThreadDetail } from "./getCommunityThreadDetail";
import type { AppClient } from "@/lib/api/client";

const getMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      community: {
        threads: {
          $get: mock(),
          $post: mock(),
          ":threadId": {
            $get: getMock,
            replies: {
              $post: mock(),
            },
          },
        },
      },
    },
  },
} as unknown as AppClient);

describe("getCommunityThreadDetail", () => {
  beforeEach(() => {
    getMock.mockClear();
  });

  it("APIが成功した場合、スレッド詳細と返信一覧を返すこと", async () => {
    const detail = {
      thread: {
        id: "thread-1",
        title: "CPI発表前後のXAUUSD",
        body: "初動を見ています。",
        category: "経済指標",
        replyCount: 1,
        createdAt: "2026-05-05T10:00:00Z",
      },
      replies: [
        {
          id: "reply-1",
          threadId: "thread-1",
          body: "NY後半も確認したいです。",
          createdAt: "2026-05-05T10:30:00Z",
        },
      ],
    };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => detail,
    });

    const result = await getCommunityThreadDetail("thread-1", createMockClient());

    expect(result).toEqual(detail);
    expect(getMock).toHaveBeenCalledWith(
      { param: { threadId: "thread-1" } },
      expect.objectContaining({
        init: expect.objectContaining({
          headers: {
            "content-type": "application/json",
          },
        }),
      }),
    );
  });

  it("APIが失敗した場合、詳細取得エラーを投げること", async () => {
    getMock.mockResolvedValue({
      ok: false,
    });

    await expect(getCommunityThreadDetail("thread-1", createMockClient())).rejects.toThrow("掲示板投稿詳細の取得に失敗しました");
  });
});
