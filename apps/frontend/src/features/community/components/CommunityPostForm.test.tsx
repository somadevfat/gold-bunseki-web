import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@/features/common/components/ToastProvider";
import { CommunityPostForm } from "./CommunityPostForm";

const createCommunityThreadMock = mock();
mock.module("@/features/community/api/createCommunityThread", () => ({
  createCommunityThread: createCommunityThreadMock,
}));

describe("CommunityPostForm", () => {
  beforeEach(() => {
    createCommunityThreadMock.mockClear();
  });

  it("shows validation errors when required fields are empty", async () => {
    render(
      <ToastProvider>
        <CommunityPostForm onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByText("タイトルを入力してください")).toBeDefined();
    expect(await screen.findByText("本文を入力してください")).toBeDefined();
    expect(createCommunityThreadMock).not.toHaveBeenCalled();
  });

  it("submits valid input and passes created thread to the parent", async () => {
    const onCreated = mock();
    const createdThread = {
      id: "thread-new",
      title: "CPI reaction plan",
      body: "Watch the first impulse and NY continuation.",
      category: "Event Watch",
      replyCount: 0,
      createdAt: "2026-05-05T10:00:00Z",
    };
    createCommunityThreadMock.mockResolvedValue(createdThread);

    render(
      <ToastProvider>
        <CommunityPostForm onCreated={onCreated} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI reaction plan" },
    });
    fireEvent.change(screen.getByLabelText("カテゴリ"), {
      target: { value: "Event Watch" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "Watch the first impulse and NY continuation." },
    });
    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    await waitFor(() => {
      expect(createCommunityThreadMock).toHaveBeenCalledWith({
        title: "CPI reaction plan",
        body: "Watch the first impulse and NY continuation.",
        category: "Event Watch",
      });
      expect(onCreated).toHaveBeenCalledWith(createdThread);
    });
    expect(await screen.findByText("投稿しました")).toBeDefined();
  });

  it("shows an error toast when creation fails", async () => {
    createCommunityThreadMock.mockRejectedValue(new Error("failed"));

    render(
      <ToastProvider>
        <CommunityPostForm onCreated={mock()} />
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "CPI reaction plan" },
    });
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "Watch the first impulse and NY continuation." },
    });
    fireEvent.click(screen.getByRole("button", { name: "投稿する" }));

    expect(await screen.findByText("投稿できませんでした")).toBeDefined();
  });
});
