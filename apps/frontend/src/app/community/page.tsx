import type { Metadata } from "next";
import { getCommunityThreads } from "@/features/community/api/getCommunityThreads";
import { CommunityThreadList } from "@/features/community/components/CommunityThreadList";
import type { CommunityThread } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "掲示板",
  description: "fanda-devのXAUUSD分析・GOLD分析に関するユーザー掲示板です。",
};

type CommunityThreadsResult =
  | { status: "success"; threads: CommunityThread[] }
  | { status: "error" };

async function resolveCommunityThreads(): Promise<CommunityThreadsResult> {
  try {
    const { threads } = await getCommunityThreads();
    return { status: "success", threads };
  } catch {
    return { status: "error" };
  }
}

/**
 * CommunityPage はユーザー掲示板ページを表示するコンポーネントです。
 * @responsibility XAUUSD分析に関する投稿一覧をAPIから取得して表示する。
 */
export default async function CommunityPage() {
  const result = await resolveCommunityThreads();

  return (
        <section className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
              Community Board
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">
              XAUUSD分析の気づきを残す掲示板。
            </h2>
            <p className="text-base leading-8 text-slate-600">
              指標前後の値動き、セッション別の荒れ方、GOLD分析の観点をユーザー同士で共有する場所です。
            </p>
          </div>

          {result.status === "success" ? (
            <CommunityThreadList threads={result.threads} />
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-lg font-semibold text-red-950">掲示板投稿を取得できませんでした</h3>
              <p className="mt-3 text-sm leading-6 text-red-800">
                時間をおいて再度お試しください。APIが未準備の場合は、投稿一覧APIの実装後に表示されます。
              </p>
            </div>
          )}
        </section>
  );
}
