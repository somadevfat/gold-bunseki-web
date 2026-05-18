import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { AppClient } from "@/lib/api/client";
import { createResearchNote } from "./createResearchNote";

const postMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      "research-notes": {
        $get: mock(),
        $post: postMock,
      },
    },
  },
} as unknown as AppClient);

describe("createResearchNote", () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it("APIが成功した場合、作成済みリサーチメモを返すこと", async () => {
    // ## Arrange ##
    const note = {
      id: "note-new",
      title: "CPI前後の値動き",
      body: "発表直後とNY後半の戻りを比較する",
      createdAt: "2026-05-05T10:00:00Z",
      updatedAt: "2026-05-05T10:00:00Z",
    };
    postMock.mockResolvedValue({
      ok: true,
      json: async () => note,
    });

    // ## Act ##
    const result = await createResearchNote({
      title: "CPI前後の値動き",
      body: "発表直後とNY後半の戻りを比較する",
    }, createMockClient());

    // ## Assert ##
    expect(result).toEqual(note);
    expect(postMock).toHaveBeenCalledWith(
      {
        json: {
          title: "CPI前後の値動き",
          body: "発表直後とNY後半の戻りを比較する",
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

  it("APIが失敗した場合、保存エラーを投げること", async () => {
    // ## Arrange ##
    postMock.mockResolvedValue({
      ok: false,
    });

    // ## Act & Assert ##
    await expect(createResearchNote({
      title: "CPI前後の値動き",
      body: "発表直後とNY後半の戻りを比較する",
    }, createMockClient())).rejects.toThrow("リサーチメモの保存に失敗しました");
  });
});
