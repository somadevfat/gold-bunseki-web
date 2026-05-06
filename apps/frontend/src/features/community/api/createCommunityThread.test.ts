import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createCommunityThread } from "./createCommunityThread";
import type { AppClient } from "@/lib/api/client";

const postMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      community: {
        threads: {
          $get: mock(),
          $post: postMock,
        },
      },
    },
  },
} as unknown as AppClient);

describe("createCommunityThread", () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it("APIが成功した場合、作成済みスレッドを返すこと", async () => {
    const thread = {
      id: "thread-new",
      title: "CPI発表後の反応確認",
      body: "初動とNY後半の戻りを比較したいです。",
      category: "経済指標",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    };
    postMock.mockResolvedValue({
      ok: true,
      json: async () => thread,
    });

    const result = await createCommunityThread({
      title: "CPI発表後の反応確認",
      body: "初動とNY後半の戻りを比較したいです。",
      category: "経済指標",
    }, createMockClient());

    expect(result).toEqual(thread);
    expect(postMock).toHaveBeenCalledWith(
      {
        json: {
          title: "CPI発表後の反応確認",
          body: "初動とNY後半の戻りを比較したいです。",
          category: "経済指標",
        },
      },
      expect.objectContaining({
        init: expect.objectContaining({
          headers: {
            "content-type": "application/json",
          },
        }),
      }),
    );
  });

  it("APIが失敗した場合、投稿作成エラーを投げること", async () => {
    postMock.mockResolvedValue({
      ok: false,
    });

    await expect(createCommunityThread({
      title: "CPI発表後の反応確認",
      body: "初動とNY後半の戻りを比較したいです。",
      category: "経済指標",
    }, createMockClient())).rejects.toThrow("掲示板投稿の作成に失敗しました");
  });
});
