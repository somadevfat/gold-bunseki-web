import { apiClient } from '../../../lib/api/client';

/**
 * getSessions は最近のマーケットセッション情報を取得します。
 * @responsibility バックエンドAPIを呼び出し、セッションリストと現在の地合い状況を返却する。
 */
export async function getSessions(limit = 12) {
  const res = await apiClient.api.v1.market.sessions.$get({
    query: { limit: limit.toString() },
  }, {
    init: { cache: 'no-store' }
  });

  if (!res.ok) {
    return { currentCondition: 'Unknown', sessions: [] };
  }

  return res.json();
}
