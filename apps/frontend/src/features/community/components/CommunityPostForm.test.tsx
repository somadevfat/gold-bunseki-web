import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityPostForm } from "./CommunityPostForm";

const createCommunityThreadMock = mock();

describe("CommunityPostForm", () => {
  beforeEach(() => {
    createCommunityThreadMock.mockClear();
  });

  it("必須項目が空の場合、入力エラーを表示すること", async () => {
    render(
      <ToastProvider>
        <CommunityPostForm createThread={createCommunityThreadMock} onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByText("タイトルを入力してください")).toBeDefined();
    expect(await screen.findByText("本文を入力してください")).toBeDefined();
    expect(createCommunityThreadMock).not.toHaveBeenCalled();
  });

  it("入力が正しい場合、投稿APIを呼び出して作成済みスレッドを親へ渡すこと", async () => {
    const onCreated = mock();
    const createdThread = {
      id: "thread-new",
      title: "CPI発表後の反応確認",
      body: "初動とNY後半の戻りを比較したいです。",
      category: "経済指標",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    };
    createCommunityThreadMock.mockResolvedValue(createdThread);

    render(
      <ToastProvider>
        <CommunityPostForm createThread={createCommunityThreadMock} onCreated={onCreated} />
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
      expect(createCommunityThreadMock).toHaveBeenCalledWith({
        title: "CPI発表後の反応確認",
        body: "初動とNY後半の戻りを比較したいです。",
        category: "経済指標",
      });
      expect(onCreated).toHaveBeenCalledWith(createdThread);
    });
    expect(await screen.findByText("投稿しました")).toBeDefined();
  });

  it("投稿APIが失敗した場合、エラー通知を表示すること", async () => {
    createCommunityThreadMock.mockRejectedValue(new Error("failed"));

    render(
      <ToastProvider>
        <CommunityPostForm createThread={createCommunityThreadMock} onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI発表後の反応確認" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "初動とNY後半の戻りを比較したいです。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByText("投稿できませんでした")).toBeDefined();
  });
});
