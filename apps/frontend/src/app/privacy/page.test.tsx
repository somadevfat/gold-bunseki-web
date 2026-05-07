import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { metadata } from "./page";

describe("PrivacyPage", () => {
  it("プライバシーとセキュリティ方針を表示すること", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy & Security" })).toBeDefined();
    expect(screen.getByText("収集する情報")).toBeDefined();
    expect(screen.getByText("Cookieと認証")).toBeDefined();
    expect(screen.getByText("問い合わせ")).toBeDefined();
  });

  it("SEO metadata が設定されていること", () => {
    expect(metadata.title).toBe("Privacy & Security");
    expect(metadata.description).toContain("プライバシー");
    expect(metadata.alternates).toEqual({ canonical: "/privacy" });
  });
});
