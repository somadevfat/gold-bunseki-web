"use client";

import { useState } from "react";
import { CommunityPostForm } from "@/features/community/components/CommunityPostForm";
import { CommunityThreadList } from "@/features/community/components/CommunityThreadList";
import type { CommunityThread } from "@/lib/api/client";

type CommunityBoardProps = {
  initialThreads: CommunityThread[];
};

/**
 * CommunityBoard owns client-side community interactions.
 * @responsibility Keep the fetched thread list in sync with newly created posts.
 */
export function CommunityBoard({ initialThreads }: CommunityBoardProps) {
  const [threads, setThreads] = useState(initialThreads);

  return (
    <div className="grid gap-5">
      <CommunityPostForm onCreated={(thread) => setThreads((current) => [thread, ...current])} />
      <CommunityThreadList threads={threads} />
    </div>
  );
}
