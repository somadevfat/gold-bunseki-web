import type { Metadata } from "next";
import { SiteFooter } from "@/features/common/components/SiteFooter";
import { SiteHeader } from "@/features/common/components/SiteHeader";

export const metadata: Metadata = {
  title: "考察ブログ",
  description: "fanda-devのXAUUSD分析・GOLD分析の考察ブログのモックページです。",
};

const insightPosts = [
  {
    category: "XAUUSD分析",
    title: "米CPIの日にゴールドが荒れやすい時間帯を整理する",
    excerpt: "発表直後の初動だけでなく、ロンドンからNYにかけた流動性の変化を見ながら過去イベントを比較します。",
  },
  {
    category: "GOLD分析",
    title: "雇用統計後の戻りをセッション別に見る",
    excerpt: "NFP直後のスプレッド拡大や一方向のブレイクだけでなく、その後の戻り幅を確認するための考察メモです。",
  },
  {
    category: "Research Note",
    title: "指標リプレイを見るときのチェックリスト",
    excerpt: "発表前レンジ、初動の方向、5分後の反転、NY後半の継続性を同じ順番で確認します。",
  },
];

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7f4ee] text-slate-900 selection:bg-amber-100">
      <main className="w-full max-w-7xl px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <SiteHeader />

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
          <div className="border-b border-slate-100 p-6 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Insight Blog
            </p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              XAUUSDとGOLD分析の考察を積み上げるブログ。
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              まだモックですが、経済指標ごとの値動きやセッション別ボラティリティの考察を記事として蓄積する場所です。
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {insightPosts.map((post) => (
              <article key={post.title} className="border-b border-slate-100 p-6 md:border-b-0 md:border-r md:last:border-r-0 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {post.category}
                </p>
                <h3 className="mt-4 text-xl font-semibold leading-8 text-slate-950">
                  {post.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
