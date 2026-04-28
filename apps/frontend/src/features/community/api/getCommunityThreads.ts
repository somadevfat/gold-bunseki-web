import { headers } from "next/headers";
import { apiClient } from "@/lib/api/client";

/**
 * getCommunityThreads は掲示板スレッド一覧を取得します。
 * @responsibility バックエンドAPIを呼び出し、Communityページで表示する投稿一覧を返却する。
 */
export async function getCommunityThreads() {
  const headerList = await headers();
  const scenario = headerList.get("x-test-scenario");
  const initHeaders: HeadersInit = {};
  if (scenario) {
    initHeaders["x-test-scenario"] = scenario;
  }

  const res = await apiClient.api.v1.community.threads.$get(undefined, {
    init: {
      cache: "no-store",
      headers: initHeaders,
      signal: AbortSignal.timeout(5000),
    },
  });

  if (!res.ok) {
    throw new Error("掲示板投稿の取得に失敗しました");
  }

  return res.json();
}
