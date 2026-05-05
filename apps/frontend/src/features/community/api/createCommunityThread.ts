import { apiClient, type CreateCommunityThreadInput } from "@/lib/api/client";

/**
 * createCommunityThread posts a new community thread to the backend API.
 * @responsibility Validate the transport result and return the created thread for optimistic UI updates.
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
