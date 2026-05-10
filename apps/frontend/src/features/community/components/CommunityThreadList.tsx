import Link from "next/link";
import type { CommunityThread } from "@/lib/api/client";

type CommunityThreadListProps = {
  threads: CommunityThread[];
};

/**
 * CommunityThreadList は掲示板スレッド一覧を表示します。
 * @responsibility 取得済み投稿と空状態をユーザーに分かりやすく表示する。
 */
export function CommunityThreadList({ threads }: CommunityThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-[#fbfaf7] p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-950">まだ投稿がありません</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          XAUUSD分析やGOLD分析の気づきが投稿されると、ここに一覧表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <article key={thread.id} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5">
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-slate-400">
            {thread.category} / {thread.replyCount}件の返信
          </p>
          <h3 className="text-lg font-semibold text-slate-950">
            <Link href={`/community/${thread.id}`} className="hover:text-amber-700">
              {thread.title}
            </Link>
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{thread.body}</p>
          <time className="mt-4 block text-xs font-medium text-slate-400" dateTime={thread.createdAt}>
            {new Intl.DateTimeFormat("ja-JP", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Tokyo",
            }).format(new Date(thread.createdAt))}
          </time>
        </article>
      ))}
    </div>
  );
}
