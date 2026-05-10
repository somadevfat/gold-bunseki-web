import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { ResearchNoteForm } from "./ResearchNoteForm";

const createResearchNoteMock = mock();

describe("ResearchNoteForm", () => {
  beforeEach(() => {
    createResearchNoteMock.mockClear();
  });

  it("入力値が不正な場合に zod のバリデーションエラーを表示すること", async () => {
    render(
      <ToastProvider>
        <ResearchNoteForm createNote={createResearchNoteMock} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "メモを保存" }));

    expect(await screen.findByText("タイトルを入力してください")).toBeDefined();
    expect(await screen.findByText("メモは10文字以上で入力してください")).toBeDefined();
    expect(createResearchNoteMock).not.toHaveBeenCalled();
  });

  it("入力値が正しい場合に保存APIを呼び出し、作成済みメモを親へ渡すこと", async () => {
    const onCreated = mock();
    const createdNote = {
      id: "note-new",
      title: "CPI前後の値動き",
      body: "発表直後とNY後半の戻りを比較する",
      createdAt: "2026-05-05T10:00:00Z",
      updatedAt: "2026-05-05T10:00:00Z",
    };
    createResearchNoteMock.mockResolvedValue(createdNote);

    render(
      <ToastProvider>
        <ResearchNoteForm createNote={createResearchNoteMock} onCreated={onCreated} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI前後の値動き" },
    });
    fireEvent.change(screen.getByLabelText("メモ"), {
      target: { value: "発表直後とNY後半の戻りを比較する" },
    });
    fireEvent.click(screen.getByRole("button", { name: "メモを保存" }));

    await waitFor(() => {
      expect(createResearchNoteMock).toHaveBeenCalledWith({
        title: "CPI前後の値動き",
        body: "発表直後とNY後半の戻りを比較する",
      });
      expect(onCreated).toHaveBeenCalledWith(createdNote);
      expect(screen.getByText("リサーチメモを保存しました")).toBeDefined();
    });
  });

  it("保存APIが失敗した場合、エラー通知を表示すること", async () => {
    createResearchNoteMock.mockRejectedValue(new Error("failed"));

    render(
      <ToastProvider>
        <ResearchNoteForm createNote={createResearchNoteMock} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI前後の値動き" },
    });
    fireEvent.change(screen.getByLabelText("メモ"), {
      target: { value: "発表直後とNY後半の戻りを比較する" },
    });
    fireEvent.click(screen.getByRole("button", { name: "メモを保存" }));

    expect(await screen.findByText("リサーチメモを保存できませんでした")).toBeDefined();
  });
});
