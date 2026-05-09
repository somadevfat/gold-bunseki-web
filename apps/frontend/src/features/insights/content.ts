export type InsightPost = {
  slug: string;
  category: string;
  title: string;
  description: string;
  publishedAt: string;
  body: string[];
};

const insightPosts: InsightPost[] = [
  {
    slug: "xauusd-cpi-session-volatility",
    category: "XAUUSD分析",
    title: "米CPIの日にゴールドが荒れやすい時間帯を整理する",
    description: "発表直後の初動だけでなく、ロンドンからNYにかけた流動性の変化を見ながら過去イベントを比較します。",
    publishedAt: "2026-05-01",
    body: [
      "米CPIの発表日は、発表直後の値幅だけでなく、その後のセッション推移まで確認すると値動きの特徴を整理しやすくなります。",
      "初動で大きく伸びた方向がそのまま続く場合もありますが、NY後半にかけて戻りが入るケースもあります。",
      "過去イベントのリプレイでは、発表前レンジ、初動の高値安値、5分後の反転、NY後半の継続性を同じ順番で確認します。",
    ],
  },
  {
    slug: "gold-nfp-reversal-by-session",
    category: "GOLD分析",
    title: "雇用統計後の戻りをセッション別に見る",
    description: "NFP直後のスプレッド拡大や一方向のブレイクだけでなく、その後の戻り幅を確認するための考察メモです。",
    publishedAt: "2026-05-03",
    body: [
      "雇用統計後のGOLDは、初動の方向だけで判断すると戻りに巻き込まれやすくなります。",
      "ロンドン時間からNY前半までのレンジと、発表後にどの程度レンジ外へ進んだかを分けて見ると、反転の強さを比較できます。",
      "戻り幅をセッション別に記録しておくと、次回のイベント前に利確や追随の判断材料として使いやすくなります。",
    ],
  },
  {
    slug: "event-replay-checklist",
    category: "Research Note",
    title: "指標リプレイを見るときのチェックリスト",
    description: "発表前レンジ、初動の方向、5分後の反転、NY後半の継続性を同じ順番で確認します。",
    publishedAt: "2026-05-05",
    body: [
      "指標リプレイを見るときは、毎回同じ観点で確認するとイベント間の比較がしやすくなります。",
      "発表前レンジ、初動の方向、5分後の反転、NY後半の継続性を順番に確認します。",
      "見た内容はリサーチメモへ残し、次のイベント前に仮説として見返せる状態にします。",
    ],
  },
];

/**
 * getInsightPosts は公開済み考察記事を新しい順で返します。
 * @responsibility 記事一覧ページが記事ソースの保持形式へ依存しないようにする。
 */
export function getInsightPosts(): InsightPost[] {
  return [...insightPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * getInsightPostBySlug はslugに一致する考察記事を返します。
 * @responsibility 詳細ページが記事ソースの保持形式へ依存しないようにする。
 */
export function getInsightPostBySlug(slug: string): InsightPost | null {
  return insightPosts.find((post) => post.slug === slug) ?? null;
}
