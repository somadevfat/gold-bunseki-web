import { describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityThreadDetail } from "./CommunityThreadDetail";

const thread = {
  id: "thread-1",
  title: "CPI発表前後のXAUUSD",
  body: "初動とNY後半を比較したいです。",
  category: "経済指標",
  replyCount: 1,
  createdAt: "2026-05-05T10:00:00Z",
};

const reply = {
  id: "reply-1",
  threadId: "thread-1",
  body: "NY後半の戻りを見ています。",
  createdAt: "2026-05-05T10:30:00Z",
};

describe("CommunityThreadDetail", () => {
  it("スレッド本文と返信一覧を表示すること", () => {
    render(
      <ToastProvider>
        <CommunityThreadDetail thread={thread} initialReplies={[reply]} />
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "CPI発表前後のXAUUSD" })).toBeDefined();
    expect(screen.getByText("初動とNY後半を比較したいです。")).toBeDefined();
    expect(screen.getByText("NY後半の戻りを見ています。")).toBeDefined();
  });

  it("返信がない場合、空状態を表示すること", () => {
    render(
      <ToastProvider>
        <CommunityThreadDetail thread={{ ...thread, replyCount: 0 }} initialReplies={[]} />
      </ToastProvider>,
    );

    expect(screen.getByText("まだ返信がありません")).toBeDefined();
  });

  it("返信投稿後、返信一覧へ即時反映すること", async () => {
    const createReply = mock(() => Promise.resolve({
      id: "reply-new",
      threadId: "thread-1",
      body: "新しい返信です。",
      createdAt: "2026-05-05T11:00:00Z",
    }));

    render(
      <ToastProvider>
        <CommunityThreadDetail
          createReply={createReply}
          thread={{ ...thread, replyCount: 0 }}
          initialReplies={[]}
        />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("返信本文"), {
      target: { value: "新しい返信です。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "返信する" }));

    await waitFor(() => {
      expect(createReply).toHaveBeenCalledWith("thread-1", { body: "新しい返信です。" });
      expect(screen.getByText("新しい返信です。")).toBeDefined();
    });
  });
});
