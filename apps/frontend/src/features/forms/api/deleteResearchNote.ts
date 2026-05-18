import { apiClient, type AppClient } from "@/lib/api/client";

/**
 * deleteResearchNote は保存済みリサーチメモを削除します。
 * @responsibility メモ削除APIの通信結果を検証し、削除成否を返す。
 */
export async function deleteResearchNote(
  noteId: string,
  client: AppClient = apiClient,
) {
  const res = await client.api.v1["research-notes"][":noteId"].$delete(
    {
      param: { noteId },
    },
    {
      init: {
        signal: AbortSignal.timeout(5000),
      },
    },
  );

  if (!res.ok) {
    throw new Error("リサーチメモの削除に失敗しました");
  }

  return res.json();
}
