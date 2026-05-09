"use client";

import { useState } from "react";
import { CommunityReplyForm } from "@/features/community/components/CommunityReplyForm";
import type { CommunityReply, CommunityThread } from "@/lib/api/client";

type CommunityThreadDetailProps = {
  thread: CommunityThread;
  initialReplies: CommunityReply[];
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

/**
 * CommunityThreadDetail は掲示板スレッド本文と返信一覧を表示します。
 * @responsibility 詳細表示、返信追加後の即時反映、空状態を担当する。
 */
export function CommunityThreadDetail({ initialReplies, thread }: CommunityThreadDetailProps) {
  const [replies, setReplies] = useState(initialReplies);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          {thread.category} / {replies.length}件の返信
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">{thread.title}</h1>
        <time className="mt-4 block text-xs font-medium text-slate-400" dateTime={thread.createdAt}>
          {formatDateTime(thread.createdAt)}
        </time>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{thread.body}</p>
      </article>

      <CommunityReplyForm
        threadId={thread.id}
        onCreated={(reply) => setReplies((current) => [...current, reply])}
      />

      <section className="space-y-3 lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-950">返信一覧</h2>
        {replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#fbfaf7] p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-950">まだ返信がありません</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              最初の返信として、追加の分析観点や検証メモを投稿できます。
            </p>
          </div>
        ) : (
          replies.map((reply) => (
            <article key={reply.id} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{reply.body}</p>
              <time className="mt-4 block text-xs font-medium text-slate-400" dateTime={reply.createdAt}>
                {formatDateTime(reply.createdAt)}
              </time>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
