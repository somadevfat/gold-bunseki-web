import { apiClient, type AppClient, type UpdateResearchNoteInput } from "@/lib/api/client";

/**
 * updateResearchNote は保存済みリサーチメモを更新します。
 * @responsibility メモ更新APIの通信結果を検証し、更新済みメモを返す。
 */
export async function updateResearchNote(
  noteId: string,
  input: UpdateResearchNoteInput,
  client: AppClient = apiClient,
) {
  const res = await client.api.v1["research-notes"][":noteId"].$patch(
    {
      param: { noteId },
      json: input,
    },
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
    throw new Error("リサーチメモの更新に失敗しました");
  }

  return res.json();
}
