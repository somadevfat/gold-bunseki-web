import { apiClient, type AppClient } from "@/lib/api/client";

/**
 * getResearchNotes は保存済みリサーチメモ一覧を取得します。
 * @responsibility メモ一覧APIの通信結果を検証し、表示用データを返す。
 */
export async function getResearchNotes(client: AppClient = apiClient) {
  const res = await client.api.v1["research-notes"].$get(undefined, {
    init: {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  });

  if (!res.ok) {
    throw new Error("リサーチメモの取得に失敗しました");
  }

  return res.json();
}
