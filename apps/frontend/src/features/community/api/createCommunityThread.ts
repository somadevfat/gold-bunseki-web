import { apiClient, type CreateCommunityThreadInput } from "@/lib/api/client";

/**
 * createCommunityThread は掲示板スレッドを新規作成します。
 * @responsibility 投稿APIの通信結果を検証し、作成済みスレッドを返す。
 */
export async function createCommunityThread(input: CreateCommunityThreadInput) {
  const res = await apiClient.api.v1.community.threads.$post(
    { json: input },
    {
      init: {
        headers: {
          "content-type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    },
  );

  if (!res.ok) {
    throw new Error("掲示板投稿の作成に失敗しました");
  }

  return res.json();
}
