import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityReplyForm } from "./CommunityReplyForm";

const createReplyMock = mock();

describe("CommunityReplyForm", () => {
  beforeEach(() => {
    createReplyMock.mockClear();
  });

  it("返信本文が空の場合、入力エラーを表示すること", async () => {
    render(
      <ToastProvider>
        <CommunityReplyForm threadId="thread-1" createReply={createReplyMock} onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "返信する" }));

    expect(await screen.findByText("返信本文を入力してください")).toBeDefined();
    expect(createReplyMock).not.toHaveBeenCalled();
  });

  it("入力が正しい場合、返信APIを呼び出して作成済み返信を親へ渡すこと", async () => {
    const onCreated = mock();
    const createdReply = {
      id: "reply-new",
      threadId: "thread-1",
      body: "NY後半の戻りを見ています。",
      createdAt: "2026-05-05T10:30:00Z",
    };
    createReplyMock.mockResolvedValue(createdReply);

    render(
      <ToastProvider>
        <CommunityReplyForm threadId="thread-1" createReply={createReplyMock} onCreated={onCreated} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("返信本文"), {
      target: { value: "NY後半の戻りを見ています。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "返信する" }));

    await waitFor(() => {
      expect(createReplyMock).toHaveBeenCalledWith("thread-1", {
        body: "NY後半の戻りを見ています。",
      });
      expect(onCreated).toHaveBeenCalledWith(createdReply);
    });
    expect(await screen.findByText("返信しました")).toBeDefined();
  });

  it("返信APIが失敗した場合、エラー通知を表示すること", async () => {
    createReplyMock.mockRejectedValue(new Error("failed"));

    render(
      <ToastProvider>
        <CommunityReplyForm threadId="thread-1" createReply={createReplyMock} onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("返信本文"), {
      target: { value: "NY後半の戻りを見ています。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "返信する" }));

    expect(await screen.findByText("返信できませんでした")).toBeDefined();
  });
});
