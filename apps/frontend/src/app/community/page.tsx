import type { Metadata } from "next";
import { SiteFooter } from "@/features/common/components/SiteFooter";
import { SiteHeader } from "@/features/common/components/SiteHeader";

export const metadata: Metadata = {
  title: "掲示板",
  description: "fanda-devのXAUUSD分析・GOLD分析に関するユーザー掲示板のモックページです。",
};

const discussionTopics = [
  {
    title: "CPI発表前後のXAUUSDの値幅をどう見ていますか？",
    meta: "Market Discussion / 12 replies",
    excerpt: "前回CPIでは発表直後の初動より、NY後半の戻りが大きかったので、今回もセッション別に見たいです。",
  },
  {
    title: "雇用統計の日はロンドン時間からボラが出やすい？",
    meta: "Session Notes / 8 replies",
    excerpt: "発表前のポジション調整っぽい動きがあるか、過去イベントのリプレイで比較したいです。",
  },
  {
    title: "GOLD分析でよく見る指標を共有するスレ",
    meta: "Research Setup / 5 replies",
    excerpt: "CPI、NFP、FOMC、PCEあたりを優先して、反応の違いをメモしていく想定です。",
  },
];

/**
 * CommunityPage はユーザー掲示板のモックページを表示するコンポーネントです。
 * @responsibility XAUUSD分析に関するユーザー間の情報共有の場（モック）を提供する。
 */
export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7f4ee] text-slate-900 selection:bg-amber-100">
      <main className="w-full max-w-7xl px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <SiteHeader />

        <section className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Community Board
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              XAUUSD分析の気づきを残す掲示板。
            </h2>
            <p className="text-base leading-8 text-slate-600">
              まだモックですが、指標前後の値動き、セッション別の荒れ方、GOLD分析の観点をユーザー同士で共有する場所として用意しています。
            </p>
          </div>

          <div className="space-y-3">
            {discussionTopics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {topic.meta}
                </p>
                <h3 className="text-lg font-semibold text-slate-950">{topic.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{topic.excerpt}</p>
              </article>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
