import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";

const getCommunityThreadDetailMock = mock();

mock.module("@/features/community/api/getCommunityThreadDetail", () => ({
  getCommunityThreadDetail: getCommunityThreadDetailMock,
}));

const { default: CommunityThreadDetailPage } = await import("./page");

describe("CommunityThreadDetailPage", () => {
  it("API取得に成功した場合、スレッド詳細を表示すること", async () => {
    getCommunityThreadDetailMock.mockResolvedValue({
      thread: {
        id: "thread-1",
        title: "CPI発表前後のXAUUSD",
        body: "初動を見ています。",
        category: "経済指標",
        replyCount: 1,
        createdAt: "2026-05-05T10:00:00Z",
      },
      replies: [
        {
          id: "reply-1",
          threadId: "thread-1",
          body: "NY後半も確認したいです。",
          createdAt: "2026-05-05T10:30:00Z",
        },
      ],
    });

    render(
      <ToastProvider>
        {await CommunityThreadDetailPage({ params: Promise.resolve({ threadId: "thread-1" }) })}
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "CPI発表前後のXAUUSD" })).toBeDefined();
    expect(screen.getByText("NY後半も確認したいです。")).toBeDefined();
  });

  it("API取得に失敗した場合、案内を表示すること", async () => {
    getCommunityThreadDetailMock.mockRejectedValue(new Error("not found"));

    render(
      <ToastProvider>
        {await CommunityThreadDetailPage({ params: Promise.resolve({ threadId: "missing" }) })}
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "掲示板投稿を表示できませんでした" })).toBeDefined();
    expect(screen.getByRole("link", { name: "掲示板一覧へ戻る" })).toBeDefined();
  });
});
