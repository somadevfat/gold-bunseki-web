import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import InsightsPage, { metadata } from "./page";
import type { InsightPost } from "@/features/insights/content";

const post: InsightPost = {
  slug: "test-post",
  category: "XAUUSD分析",
  title: "テスト記事",
  description: "テスト記事の抜粋です。",
  publishedAt: "2026-05-05",
  body: ["本文です。"],
};

describe("InsightsPage", () => {
  it("記事ソースから取得した記事一覧を表示すること", () => {
    render(<InsightsPage getPosts={() => [post]} />);

    expect(screen.getByRole("heading", { name: "XAUUSDとGOLD分析の考察を積み上げるブログ。" })).toBeDefined();
    expect(screen.getByRole("link", { name: "テスト記事" }).getAttribute("href")).toBe("/insights/test-post");
    expect(screen.getByText("XAUUSD分析")).toBeDefined();
    expect(screen.getByText("テスト記事の抜粋です。")).toBeDefined();
    expect(screen.getByText("2026年5月5日")).toBeDefined();
  });

  it("記事が0件の場合、空状態を表示すること", () => {
    render(<InsightsPage getPosts={() => []} />);

    expect(screen.getByText("まだ記事がありません")).toBeDefined();
  });

  it("記事取得に失敗した場合、エラー表示を出すこと", () => {
    render(<InsightsPage getPosts={() => { throw new Error("failed"); }} />);

    expect(screen.getByText("記事一覧を取得できませんでした")).toBeDefined();
  });

  it("SEO metadata が設定されていること", () => {
    expect(metadata.title).toBe("考察ブログ");
    expect(metadata.description).toContain("考察ブログ");
  });
});
