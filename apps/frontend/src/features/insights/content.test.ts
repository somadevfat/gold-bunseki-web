import { describe, expect, it } from "bun:test";
import { getInsightPostBySlug, getInsightPosts } from "./content";

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

  it("slugで記事を取得できること", () => {
    const post = getInsightPostBySlug("event-replay-checklist");

    expect(post?.title).toBe("指標リプレイを見るときのチェックリスト");
  });

  it("存在しないslugの場合 null を返すこと", () => {
    expect(getInsightPostBySlug("missing")).toBeNull();
  });

  it("取得した記事オブジェクトを変更しても元のデータに影響しないこと", () => {
    const post = getInsightPostBySlug("event-replay-checklist");
    if (post) {
      post.title = "MODIFIED";
      post.body.push("NEW PARAGRAPH");
    }

    const original = getInsightPostBySlug("event-replay-checklist");

    expect(original?.title).not.toBe("MODIFIED");
    expect(original?.body).not.toContain("NEW PARAGRAPH");
  });
});
