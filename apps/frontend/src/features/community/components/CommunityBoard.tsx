"use client";

import { useState } from "react";
import { CommunityPostForm } from "@/features/community/components/CommunityPostForm";
import { createCommunityThread } from "@/features/community/api/createCommunityThread";
import { CommunityThreadList } from "@/features/community/components/CommunityThreadList";
import type { CommunityThread } from "@/lib/api/client";

type CommunityBoardProps = {
  initialThreads: CommunityThread[];
  createThread?: typeof createCommunityThread;
};

/**
 * CommunityBoard は掲示板のクライアント操作をまとめます。
 * @responsibility 初期表示済みの投稿一覧へ、新規作成された投稿を反映する。
 */
export function CommunityBoard({ createThread, initialThreads }: CommunityBoardProps) {
  const [threads, setThreads] = useState(initialThreads);

  return (
    <div className="grid gap-5">
      <CommunityPostForm createThread={createThread} onCreated={(thread) => setThreads((current) => [thread, ...current])} />
      <CommunityThreadList threads={threads} />
    </div>
  );
}
