import { describe, expect, it } from "bun:test";
import { getInsightPosts } from "./content";

describe("insights content", () => {
  it("公開日が新しい順で記事一覧を返すこと", () => {
    const posts = getInsightPosts();

    expect(posts.map((post) => post.slug)).toEqual([
      "event-replay-checklist",
      "gold-nfp-reversal-by-session",
      "xauusd-cpi-session-volatility",
    ]);
  });

  it("一覧表示に必要なメタ情報を持つこと", () => {
    const [post] = getInsightPosts();

    expect(post.slug).toBeTruthy();
    expect(post.category).toBeTruthy();
    expect(post.title).toBeTruthy();
    expect(post.description).toBeTruthy();
    expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
