import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { ResearchNotesPanel, formatResearchNoteDate } from "./ResearchNotesPanel";

const loadNotesMock = mock();
const updateNoteMock = mock();
const deleteNoteMock = mock();

describe("ResearchNotesPanel", () => {
  beforeEach(() => {
    loadNotesMock.mockClear();
    updateNoteMock.mockClear();
    deleteNoteMock.mockClear();
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

  it("保存済みメモを編集できること", async () => {
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
    updateNoteMock.mockResolvedValue({
      id: "note-1",
      title: "CPI発表後の観察メモ",
      body: "初動とNY後半の戻りを比較する",
      createdAt: "2026-05-05T10:00:00Z",
      updatedAt: "2026-05-05T11:00:00Z",
    });

    // ## Act ##
    render(
      <ToastProvider>
        <ResearchNotesPanel
          loadNotes={loadNotesMock}
          updateNote={updateNoteMock}
          deleteNote={deleteNoteMock}
        />
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "編集" }));
    fireEvent.change(screen.getByDisplayValue("CPI前後の値動き"), {
      target: { value: "CPI発表後の観察メモ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新する" }));

    // ## Assert ##
    await waitFor(() => {
      expect(updateNoteMock).toHaveBeenCalledWith("note-1", {
        title: "CPI発表後の観察メモ",
        body: "発表直後とNY後半の戻りを比較する",
      });
    });
    expect(await screen.findByText("リサーチメモを更新しました")).toBeDefined();
    expect(screen.getByText("CPI発表後の観察メモ")).toBeDefined();
  });

  it("編集フォームでもzodバリデーションが効くこと", async () => {
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
        <ResearchNotesPanel loadNotes={loadNotesMock} updateNote={updateNoteMock} />
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "編集" }));
    fireEvent.change(screen.getByDisplayValue("CPI前後の値動き"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新する" }));

    // ## Assert ##
    expect(await screen.findByText("タイトルを入力してください")).toBeDefined();
    expect(updateNoteMock).not.toHaveBeenCalled();
  });

  it("削除前に確認UIを表示し、確定後に一覧から取り除くこと", async () => {
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
    deleteNoteMock.mockResolvedValue({ success: true });

    // ## Act ##
    render(
      <ToastProvider>
        <ResearchNotesPanel loadNotes={loadNotesMock} deleteNote={deleteNoteMock} />
      </ToastProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "削除" }));
    expect(screen.getByText("リサーチメモを削除しますか？")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    // ## Assert ##
    await waitFor(() => {
      expect(deleteNoteMock).toHaveBeenCalledWith("note-1");
    });
    expect(await screen.findByText("リサーチメモを削除しました")).toBeDefined();
    expect(screen.getByText("まだ保存済みメモはありません。")).toBeDefined();
  });
});
