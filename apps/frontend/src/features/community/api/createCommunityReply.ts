import { apiClient, type AppClient, type CommunityReply, type CreateCommunityReplyInput } from "@/lib/api/client";

/**
 * createCommunityReply は掲示板スレッドへ返信を投稿します。
 * @responsibility 返信投稿APIのHTTP失敗をフォームで扱いやすい例外へ変換する。
 */
export async function createCommunityReply(
  threadId: string,
  input: CreateCommunityReplyInput,
  client: AppClient = apiClient,
): Promise<CommunityReply> {
  const res = await client.api.v1.community.threads[":threadId"].replies.$post(
    {
      param: { threadId },
      json: input,
    },
    {
      init: {
        headers: {
          "content-type": "application/json",
        },
      },
    },
  );

  if (!res.ok) {
    throw new Error("掲示板返信の投稿に失敗しました");
  }

  return res.json();
}
