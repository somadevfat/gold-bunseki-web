import { apiClient, type AppClient, type CreateResearchNoteInput } from "@/lib/api/client";

/**
 * createResearchNote はリサーチメモを新規作成します。
 * @responsibility メモ保存APIの通信結果を検証し、作成済みメモを返す。
 */
export async function createResearchNote(
  input: CreateResearchNoteInput,
  client: AppClient = apiClient,
) {
  const res = await client.api.v1["research-notes"].$post(
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
    throw new Error("リサーチメモの保存に失敗しました");
  }

  return res.json();
}
