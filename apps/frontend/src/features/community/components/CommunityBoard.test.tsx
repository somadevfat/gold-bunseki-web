import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityBoard } from "./CommunityBoard";

const createCommunityThreadMock = mock();

describe("CommunityBoard", () => {
  it("投稿作成後、作成済みスレッドを一覧へ先頭追加すること", async () => {
    createCommunityThreadMock.mockResolvedValue({
      id: "thread-new",
      title: "CPI発表後の反応確認",
      body: "初動とNY後半の戻りを比較したいです。",
      category: "経済指標",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    });

    render(
      <ToastProvider>
        <CommunityBoard createThread={createCommunityThreadMock} initialThreads={[]} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI発表後の反応確認" },
    });
    fireEvent.change(screen.getByLabelText("カテゴリ"), {
      target: { value: "経済指標" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "初動とNY後半の戻りを比較したいです。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => {
      expect(screen.getByText("CPI発表後の反応確認")).toBeDefined();
    });
    expect(screen.queryByText("まだ投稿がありません")).toBeNull();
  });
});
