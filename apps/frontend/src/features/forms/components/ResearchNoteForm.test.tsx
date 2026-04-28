import { describe, expect, it } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { ResearchNoteForm } from "./ResearchNoteForm";

describe("ResearchNoteForm", () => {
  it("入力値が不正な場合に zod のバリデーションエラーを表示すること", async () => {
    render(
      <ToastProvider>
        <ResearchNoteForm />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "メモを保存" }));

    expect(await screen.findByText("タイトルを入力してください")).toBeDefined();
    expect(await screen.findByText("メモは10文字以上で入力してください")).toBeDefined();
  });

  it("入力値が正しい場合に保存トーストを表示すること", async () => {
    render(
      <ToastProvider>
        <ResearchNoteForm />
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
      expect(screen.getByText("リサーチメモを保存しました")).toBeDefined();
    });
  });
});
