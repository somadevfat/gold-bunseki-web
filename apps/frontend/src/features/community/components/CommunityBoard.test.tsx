import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityBoard } from "./CommunityBoard";

const createCommunityThreadMock = mock();
mock.module("@/features/community/api/createCommunityThread", () => ({
  createCommunityThread: createCommunityThreadMock,
}));

describe("CommunityBoard", () => {
  it("prepends a created thread to the visible list", async () => {
    createCommunityThreadMock.mockResolvedValue({
      id: "thread-new",
      title: "New CPI reaction plan",
      body: "Watch the first impulse and NY continuation.",
      category: "Event Watch",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    });

    render(
      <ToastProvider>
        <CommunityBoard initialThreads={[]} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "New CPI reaction plan" },
    });
    fireEvent.change(screen.getByLabelText("カテゴリ"), {
      target: { value: "Event Watch" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "Watch the first impulse and NY continuation." },
    });
    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => {
      expect(screen.getByText("New CPI reaction plan")).toBeDefined();
    });
    expect(screen.queryByText("まだ投稿がありません")).toBeNull();
  });
});
