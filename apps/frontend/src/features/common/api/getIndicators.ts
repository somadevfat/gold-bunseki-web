import { headers } from 'next/headers';
import { apiClient } from '../../../lib/api/client';

/**
 * getIndicators は直近発表された経済指標のリストを取得します。
 * @responsibility バックエンドAPIを呼び出し、RSCで使用するための指標リストを返却する。
 */
export async function getIndicators() {
  const headerList = await headers();
  const scenario = headerList.get('x-test-scenario');
  const initHeaders: HeadersInit = {};
  if (scenario) {
    initHeaders['x-test-scenario'] = scenario;
  }

  const res = await apiClient.api.v1.market.indicators.$get(undefined, {
    /* ハング防止のため 5 秒でタイムアウト */
    init: { cache: 'no-store', headers: initHeaders, signal: AbortSignal.timeout(5000) }
  });

  if (!res.ok) {
    throw new Error('指標データの取得に失敗しました');
  }

  return res.json();
}
