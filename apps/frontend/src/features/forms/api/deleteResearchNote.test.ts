import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { AppClient } from "@/lib/api/client";
import { deleteResearchNote } from "./deleteResearchNote";

const deleteMock = mock();

const createMockClient = (): AppClient => ({
  api: {
    v1: {
      "research-notes": {
        $get: mock(),
        $post: mock(),
        ":noteId": {
          $patch: mock(),
          $delete: deleteMock,
        },
      },
    },
  },
} as unknown as AppClient);

describe("deleteResearchNote", () => {
  beforeEach(() => {
    deleteMock.mockClear();
  });

  it("APIが成功した場合、削除結果を返すこと", async () => {
    // ## Arrange ##
    deleteMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // ## Act ##
    const result = await deleteResearchNote("note-1", createMockClient());

    // ## Assert ##
    expect(result).toEqual({ success: true });
    expect(deleteMock).toHaveBeenCalledWith(
      {
        param: { noteId: "note-1" },
      },
      expect.objectContaining({
        init: expect.any(Object),
      }),
    );
  });

  it("APIが失敗した場合、削除エラーを投げること", async () => {
    // ## Arrange ##
    deleteMock.mockResolvedValue({
      ok: false,
    });

    // ## Act & Assert ##
    await expect(deleteResearchNote("note-1", createMockClient())).rejects.toThrow("リサーチメモの削除に失敗しました");
  });
});
