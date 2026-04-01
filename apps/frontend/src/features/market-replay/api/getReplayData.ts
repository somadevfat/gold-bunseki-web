import { apiClient } from '../../../lib/api/client';

/**
 * getReplayData は指定された経済指標に関する再現データを取得します。
 * @responsibility バックエンドAPIを呼び出し、RSCで使用するための再現データを返却する。
 */
export async function getReplayData(eventName: string) {
  const res = await apiClient.api.v1.market.replay.$get({
    query: { event: eventName },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
