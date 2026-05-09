import { apiClient, type AppClient, type CommunityThreadDetailResponse } from "@/lib/api/client";

/**
 * getCommunityThreadDetail は掲示板スレッド詳細と返信一覧を取得します。
 * @responsibility 詳細APIの失敗をUIで扱いやすい例外へ変換する。
 */
export async function getCommunityThreadDetail(
  threadId: string,
  client: AppClient = apiClient,
): Promise<CommunityThreadDetailResponse> {
  const res = await client.api.v1.community.threads[":threadId"].$get(
    { param: { threadId } },
    {
      init: {
        headers: {
          "content-type": "application/json",
        },
      },
    },
  );

  if (!res.ok) {
    throw new Error("掲示板投稿詳細の取得に失敗しました");
  }

  return res.json();
}
