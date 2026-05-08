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
});
