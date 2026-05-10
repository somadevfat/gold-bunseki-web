import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { ResearchNotesPanel, formatResearchNoteDate } from "./ResearchNotesPanel";

const loadNotesMock = mock();

describe("ResearchNotesPanel", () => {
  beforeEach(() => {
    loadNotesMock.mockClear();
  });

  it("保存済みメモ一覧を表示すること", async () => {
    // ## Arrange ##
    loadNotesMock.mockResolvedValue({
      notes: [
        {
          id: "note-1",
          title: "CPI前後の値動き",
          body: "発表直後とNY後半の戻りを比較する",
          createdAt: "2026-05-05T10:00:00Z",
          updatedAt: "2026-05-05T10:00:00Z",
        },
      ],
    });

    // ## Act ##
    render(
      <ToastProvider>
        <ResearchNotesPanel loadNotes={loadNotesMock} />
      </ToastProvider>,
    );

    // ## Assert ##
    expect(screen.getByLabelText("リサーチメモを読み込み中")).toBeDefined();
    expect(await screen.findByText("CPI前後の値動き")).toBeDefined();
    expect(screen.getByText("発表直後とNY後半の戻りを比較する")).toBeDefined();
  });

  it("保存済みメモが0件の場合、空状態を表示すること", async () => {
    // ## Arrange ##
    loadNotesMock.mockResolvedValue({ notes: [] });

    // ## Act ##
    render(
      <ToastProvider>
        <ResearchNotesPanel loadNotes={loadNotesMock} />
      </ToastProvider>,
    );

    // ## Assert ##
    expect(await screen.findByText("まだ保存済みメモはありません。")).toBeDefined();
  });

  it("取得に失敗した場合、エラー表示を出すこと", async () => {
    // ## Arrange ##
    loadNotesMock.mockRejectedValue(new Error("failed"));

    // ## Act ##
    render(
      <ToastProvider>
        <ResearchNotesPanel loadNotes={loadNotesMock} />
      </ToastProvider>,
    );

    // ## Assert ##
    expect(await screen.findByText("リサーチメモを読み込めませんでした")).toBeDefined();
  });

  it("保存日時を短い日本語表記へ変換すること", () => {
    // ## Arrange ##
    const value = "2026-05-05T10:00:00Z";

    // ## Act ##
    const result = formatResearchNoteDate(value);

    // ## Assert ##
    expect(result).toContain("05/05");
  });
});
