import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { AppClient } from "@/lib/api/client";
import { updateResearchNote } from "./updateResearchNote";

const patchMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      "research-notes": {
        $get: mock(),
        $post: mock(),
        ":noteId": {
          $patch: patchMock,
          $delete: mock(),
        },
      },
    },
  },
} as unknown as AppClient);

describe("updateResearchNote", () => {
  beforeEach(() => {
    patchMock.mockClear();
  });

  it("APIが成功した場合、更新済みリサーチメモを返すこと", async () => {
    // ## Arrange ##
    const note = {
      id: "note-1",
      title: "CPI発表後の観察メモ",
      body: "初動とNY後半の戻りを比較する",
      createdAt: "2026-05-05T10:00:00Z",
      updatedAt: "2026-05-05T10:30:00Z",
    };
    patchMock.mockResolvedValue({
      ok: true,
      json: async () => note,
    });

    // ## Act ##
    const result = await updateResearchNote("note-1", {
      title: note.title,
      body: note.body,
    }, createMockClient());

    // ## Assert ##
    expect(result).toEqual(note);
    expect(patchMock).toHaveBeenCalledWith(
      {
        param: { noteId: "note-1" },
        json: {
          title: note.title,
          body: note.body,
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

  it("APIが失敗した場合、更新エラーを投げること", async () => {
    // ## Arrange ##
    patchMock.mockResolvedValue({
      ok: false,
    });

    // ## Act & Assert ##
    await expect(updateResearchNote("note-1", {
      title: "CPI発表後の観察メモ",
      body: "初動とNY後半の戻りを比較する",
    }, createMockClient())).rejects.toThrow("リサーチメモの更新に失敗しました");
  });
});
