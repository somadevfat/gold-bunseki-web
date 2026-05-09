import type { Metadata } from "next";
import Link from "next/link";
import { getInsightPosts, type InsightPost } from "@/features/insights/content";

export const metadata: Metadata = {
  title: "考察ブログ",
  description: "fanda-devのXAUUSD分析・GOLD分析の考察ブログです。",
};

type InsightsPageProps = {
  getPosts?: () => InsightPost[];
};

type InsightPostsResult =
  | { status: "success"; posts: InsightPost[] }
  | { status: "error" };

const publishedDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
  timeZone: "Asia/Tokyo",
});

/**
 * resolveInsightPosts は記事取得処理をラップし、成功または失敗の状態を返します。
 * @responsibility 記事取得処理のエラーをハンドリングし、結果を統一された形式で提供する。
 */
function resolveInsightPosts(getPosts: () => InsightPost[]): InsightPostsResult {
  try {
    return { status: "success", posts: getPosts() };
  } catch {
    return { status: "error" };
  }
}

/**
 * InsightsPage は考察ブログの記事一覧ページです。
 * @responsibility 記事ソースから取得した記事一覧、空状態、取得失敗を表示する。
 */
export default function InsightsPage({ getPosts = getInsightPosts }: InsightsPageProps = {}) {
  const result = resolveInsightPosts(getPosts);

  return (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
          <div className="border-b border-slate-100 p-6 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Insight Blog
            </p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              XAUUSDとGOLD分析の考察を積み上げるブログ。
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              経済指標ごとの値動きやセッション別ボラティリティの考察を記事として蓄積する場所です。
            </p>
          </div>

          {result.status === "error" ? (
            <div className="p-6 lg:p-8">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-lg font-semibold text-red-950">記事一覧を取得できませんでした</h3>
                <p className="mt-3 text-sm leading-6 text-red-800">
                  時間をおいて再度お試しください。記事ソースの設定に問題がある場合は、運用ドキュメントを確認してください。
                </p>
              </div>
            </div>
          ) : result.posts.length === 0 ? (
            <div className="p-6 lg:p-8">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-[#fbfaf7] p-6 text-center">
                <h3 className="text-lg font-semibold text-slate-950">まだ記事がありません</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  XAUUSD分析やGOLD分析の記事が公開されると、ここに一覧表示されます。
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-0 md:grid-cols-3">
              {result.posts.map((post) => (
                <article key={post.slug} className="border-b border-slate-100 p-6 md:border-b-0 md:border-r md:last:border-r-0 lg:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {post.category}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-8 text-slate-950">
                    <Link href={`/insights/${post.slug}`} className="hover:text-amber-700">
                      {post.title}
                    </Link>
                  </h3>
                  <time className="mt-3 block text-xs font-medium text-slate-400" dateTime={post.publishedAt}>
                    {publishedDateFormatter.format(new Date(post.publishedAt))}
                  </time>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{post.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
  );
}
