import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createCommunityReply } from "./createCommunityReply";
import type { AppClient } from "@/lib/api/client";

const postMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      community: {
        threads: {
          $get: mock(),
          $post: mock(),
          ":threadId": {
            $get: mock(),
            replies: {
              $post: postMock,
            },
          },
        },
      },
    },
  },
} as unknown as AppClient);

describe("createCommunityReply", () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it("APIが成功した場合、作成済み返信を返すこと", async () => {
    const reply = {
      id: "reply-new",
      threadId: "thread-1",
      body: "NY後半の戻りを見ています。",
      createdAt: "2026-05-05T10:30:00Z",
    };
    postMock.mockResolvedValue({
      ok: true,
      json: async () => reply,
    });

    const result = await createCommunityReply("thread-1", { body: "NY後半の戻りを見ています。" }, createMockClient());

    expect(result).toEqual(reply);
    expect(postMock).toHaveBeenCalledWith(
      {
        param: { threadId: "thread-1" },
        json: { body: "NY後半の戻りを見ています。" },
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

  it("APIが失敗した場合、返信投稿エラーを投げること", async () => {
    postMock.mockResolvedValue({
      ok: false,
    });

    await expect(createCommunityReply("thread-1", { body: "NY後半の戻りを見ています。" }, createMockClient())).rejects.toThrow("掲示板返信の投稿に失敗しました");
  });
});
