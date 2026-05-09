import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityThreadDetail } from "@/features/community/api/getCommunityThreadDetail";
import { CommunityThreadDetail } from "@/features/community/components/CommunityThreadDetail";
import type { CommunityThreadDetailResponse } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "掲示板投稿詳細",
  description: "fanda-devのXAUUSD分析・GOLD分析に関する掲示板投稿詳細です。",
};

type CommunityThreadDetailPageProps = {
  params: Promise<{ threadId: string }>;
};

/**
 * resolveCommunityThreadDetail は掲示板スレッド詳細を取得し、失敗時は null を返します。
 * @responsibility API エラーをキャッチして、ページコンポーネントで扱いやすい形式に変換する。
 */
async function resolveCommunityThreadDetail(threadId: string): Promise<CommunityThreadDetailResponse | null> {
  try {
    return await getCommunityThreadDetail(threadId);
  } catch {
    return null;
  }
}

/**
 * CommunityThreadDetailPage は掲示板スレッド詳細ページを表示します。
 * @responsibility URLのthreadIdから詳細と返信一覧を取得し、失敗時の案内を表示する。
 */
export default async function CommunityThreadDetailPage({ params }: CommunityThreadDetailPageProps) {
  const { threadId } = await params;
  const detail = await resolveCommunityThreadDetail(threadId);

  if (!detail) {
    return (
      <section className="space-y-5 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Community Board</p>
        <h1 className="text-2xl font-semibold text-red-950">掲示板投稿を表示できませんでした</h1>
        <p className="text-sm leading-6 text-red-800">
          投稿が存在しないか、APIから詳細を取得できませんでした。掲示板一覧から投稿を選び直してください。
        </p>
        <Link href="/community" className="inline-flex rounded-xl bg-red-950 px-4 py-2 text-sm font-semibold text-white">
          掲示板一覧へ戻る
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link href="/community" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
        掲示板一覧へ戻る
      </Link>
      <CommunityThreadDetail key={threadId} thread={detail.thread} initialReplies={detail.replies} />
    </section>
  );
}
