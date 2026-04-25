import { headers } from 'next/headers';
import { apiClient } from '../../../lib/api/client';

/**
 * getReplayData は指定された経済指標に関する再現データを取得します。
 * @responsibility バックエンドAPIを呼び出し、RSCで使用するための再現データを返却する。
 */
export async function getReplayData(eventName: string) {
  const headerList = await headers();
  const scenario = headerList.get('x-test-scenario');
  const initHeaders: HeadersInit = {};
  if (scenario) {
    initHeaders['x-test-scenario'] = scenario;
  }

  const res = await apiClient.api.v1.market.replay.$get({
    query: { event: eventName },
  }, {
    /* ハング防止のため 5 秒でタイムアウト */
    init: { cache: 'no-store', headers: initHeaders, signal: AbortSignal.timeout(5000) }
  });

  if (!res.ok) {
    throw new Error('再現データの取得に失敗しました');
  }

  return res.json();
}
