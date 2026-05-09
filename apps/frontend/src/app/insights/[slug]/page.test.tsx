import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import InsightDetailPage, { generateMetadata } from "./page";

describe("InsightDetailPage", () => {
  it("slugに対応する記事詳細を表示すること", async () => {
    render(await InsightDetailPage({ params: Promise.resolve({ slug: "event-replay-checklist" }) }));

    expect(screen.getByRole("heading", { name: "指標リプレイを見るときのチェックリスト" })).toBeDefined();
    expect(screen.getByText("Research Note")).toBeDefined();
    expect(screen.getByText(/毎回同じ観点で確認/)).toBeDefined();
    expect(screen.getByRole("link", { name: "考察ブログ一覧へ戻る" }).getAttribute("href")).toBe("/insights");
  });

  it("存在しないslugの場合、案内を表示すること", async () => {
    render(await InsightDetailPage({ params: Promise.resolve({ slug: "missing" }) }));

    expect(screen.getByRole("heading", { name: "記事が見つかりません" })).toBeDefined();
    expect(screen.getByRole("link", { name: "考察ブログ一覧へ戻る" }).getAttribute("href")).toBe("/insights");
  });

  it("記事ごとのmetadataを生成すること", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "event-replay-checklist" }) });

    expect(metadata.title).toBe("指標リプレイを見るときのチェックリスト");
    expect(metadata.description).toContain("発表前レンジ");
    expect(metadata.alternates).toEqual({ canonical: "/insights/event-replay-checklist" });
  });

  it("存在しない記事のmetadataを生成すること", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "missing" }) });

    expect(metadata.title).toBe("記事が見つかりません");
  });
});
