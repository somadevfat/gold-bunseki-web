import { headers } from 'next/headers';
import { apiClient } from '../../../lib/api/client';

/**
 * getSessions は最近のマーケットセッション情報を取得します。
 * @responsibility バックエンドAPIを呼び出し、セッションリストと現在の地合い状況を返却する。
 */
export async function getSessions(limit = 12) {
  const headerList = await headers();
  const scenario = headerList.get('x-test-scenario');
  const initHeaders: HeadersInit = {};
  if (scenario) {
    initHeaders['x-test-scenario'] = scenario;
  }

  const res = await apiClient.api.v1.market.sessions.$get({
    query: { limit: limit.toString() },
  }, {
    /* ハング防止のため 5 秒でタイムアウト */
    init: { cache: 'no-store', headers: initHeaders, signal: AbortSignal.timeout(5000) }
  });

  if (!res.ok) {
    throw new Error('セッションデータの取得に失敗しました');
  }

  return res.json();
}
