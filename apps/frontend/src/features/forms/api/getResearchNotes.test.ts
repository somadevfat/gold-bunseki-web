import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { AppClient } from "@/lib/api/client";
import { getResearchNotes } from "./getResearchNotes";

const getMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      "research-notes": {
        $get: getMock,
        $post: mock(),
      },
    },
  },
} as unknown as AppClient);

describe("getResearchNotes", () => {
  beforeEach(() => {
    getMock.mockClear();
  });

  it("APIが成功した場合、保存済みリサーチメモ一覧を返すこと", async () => {
    // ## Arrange ##
    const response = {
      notes: [
        {
          id: "note-1",
          title: "CPI前後の値動き",
          body: "発表直後とNY後半の戻りを比較する",
          createdAt: "2026-05-05T10:00:00Z",
          updatedAt: "2026-05-05T10:00:00Z",
        },
      ],
    };
    getMock.mockResolvedValue({
      ok: true,
      json: async () => response,
    });

    // ## Act ##
    const result = await getResearchNotes(createMockClient());

    // ## Assert ##
    expect(result).toEqual(response);
    expect(getMock).toHaveBeenCalledWith(undefined, {
      init: expect.objectContaining({
        cache: "no-store",
      }),
    });
  });

  it("APIが失敗した場合、取得エラーを投げること", async () => {
    // ## Arrange ##
    getMock.mockResolvedValue({
      ok: false,
    });

    // ## Act & Assert ##
    await expect(getResearchNotes(createMockClient())).rejects.toThrow("リサーチメモの取得に失敗しました");
  });
});
