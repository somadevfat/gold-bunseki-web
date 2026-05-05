import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createCommunityThread } from "./createCommunityThread";

const postMock = mock();
mock.module("@/lib/api/client", () => ({
  apiClient: {
    api: {
      v1: {
        community: {
          threads: {
            $post: postMock,
          },
        },
      },
    },
  },
}));

describe("createCommunityThread", () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it("created thread is returned when API succeeds", async () => {
    const thread = {
      id: "thread-new",
      title: "CPI reaction plan",
      body: "Watch the first impulse and NY continuation.",
      category: "Market Discussion",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    };
    postMock.mockResolvedValue({
      ok: true,
      json: async () => thread,
    });

    const result = await createCommunityThread({
      title: "CPI reaction plan",
      body: "Watch the first impulse and NY continuation.",
      category: "Market Discussion",
    });

    expect(result).toEqual(thread);
    expect(postMock).toHaveBeenCalledWith(
      {
        json: {
          title: "CPI reaction plan",
          body: "Watch the first impulse and NY continuation.",
          category: "Market Discussion",
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

  it("throws a readable error when API fails", () => {
    postMock.mockResolvedValue({
      ok: false,
    });

    expect(createCommunityThread({
      title: "CPI reaction plan",
      body: "Watch the first impulse and NY continuation.",
      category: "Market Discussion",
    })).rejects.toThrow("掲示板投稿の作成に失敗しました");
  });
});
