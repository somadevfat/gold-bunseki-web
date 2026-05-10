import { describe, expect, it } from "bun:test";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("主要ページのURLを含むこと", () => {
    const urls = sitemap().map((item) => item.url);

    expect(urls).toContain("https://fanda-dev.com");
    expect(urls).toContain("https://fanda-dev.com/privacy");
    expect(urls).toContain("https://fanda-dev.com/api-docs");
    expect(urls).toContain("https://fanda-dev.com/status");
  });

  it("考察ブログの記事URLを含むこと", () => {
    const items = sitemap();
    const urls = items.map((item) => item.url);

    expect(urls).toContain("https://fanda-dev.com/insights/event-replay-checklist");
    expect(urls).toContain("https://fanda-dev.com/insights/gold-nfp-reversal-by-session");
    expect(items.find((item) => item.url.endsWith("/insights/event-replay-checklist"))?.priority).toBe(0.7);
  });
});
