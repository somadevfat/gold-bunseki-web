import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { CommunityThreadList } from "./CommunityThreadList";
import type { CommunityThread } from "@/lib/api/client";

const threads: CommunityThread[] = [
  {
    id: "thread-1",
    title: "CPI発表後のXAUUSDの値幅をどう見ていますか？",
    category: "Market Discussion",
    body: "発表直後の初動とNY後半の戻りを比較したいです。",
    replyCount: 12,
    createdAt: "2026-04-01T12:00:00Z",
  },
];

describe("CommunityThreadList", () => {
  it("投稿一覧がある場合にスレッド情報を表示すること", () => {
    render(<CommunityThreadList threads={threads} />);

    expect(screen.getByText("CPI発表後のXAUUSDの値幅をどう見ていますか？")).toBeDefined();
    expect(screen.getByText("Market Discussion / 12 replies")).toBeDefined();
    expect(screen.getByText("発表直後の初動とNY後半の戻りを比較したいです。")).toBeDefined();
  });

  it("投稿一覧が空の場合に空状態の案内を表示すること", () => {
    render(<CommunityThreadList threads={[]} />);

    expect(screen.getByText("まだ投稿がありません")).toBeDefined();
    expect(screen.getByText("XAUUSD分析やGOLD分析の気づきが投稿されると、ここに一覧表示されます。")).toBeDefined();
  });
});
