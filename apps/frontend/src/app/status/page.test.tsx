import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { StatusContent, metadata } from "./page";

describe("StatusPage", () => {
  it("同期ステータスと最終更新情報を表示すること", () => {
    render(<StatusContent status={{
      lastCandleAt: "2026-04-01T10:00:00Z",
      lastSessionAt: "2026-04-01",
      lastEventAt: "2026-04-01T10:00:00Z",
      totalCandles: 10000,
      syncHealth: "Healthy",
    }} />);

    expect(screen.getByRole("heading", { name: "Status" })).toBeDefined();
    expect(screen.getByText("Healthy")).toBeDefined();
    expect(screen.getByText("Latest Candle")).toBeDefined();
    expect(screen.getByText("Latest Session")).toBeDefined();
    expect(screen.getByText("Latest Event")).toBeDefined();
    expect(screen.getByText("Stored Candles")).toBeDefined();
    expect(screen.getByText("10,000")).toBeDefined();
  });

  it("同期ステータスの取得に失敗した場合、案内を表示すること", () => {
    render(<StatusContent status={null} errorMessage="同期ステータスの取得に失敗しました" />);

    expect(screen.getByText("Unknown")).toBeDefined();
    expect(screen.getByText(/バックエンドAPIの起動状態を確認してください/)).toBeDefined();
  });

  it("SEO metadata が設定されていること", () => {
    expect(metadata.title).toBe("Status");
    expect(metadata.description).toContain("同期ステータス");
    expect(metadata.alternates).toEqual({ canonical: "/status" });
  });
});
