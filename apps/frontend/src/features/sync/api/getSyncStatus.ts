import { headers } from 'next/headers';
import { apiClient } from '../../../lib/api/client';

/**
 * getSyncStatus はバックエンドが把握している最新の同期状況を取得します。
 * @responsibility Statusページで表示する同期ヘルスと最終更新時刻を返却する。
 */
export async function getSyncStatus() {
  const headerList = await headers();
  const scenario = headerList.get('x-test-scenario');
  const initHeaders: HeadersInit = {};
  if (scenario) {
    initHeaders['x-test-scenario'] = scenario;
  }

  const res = await apiClient.api.v1.sync.status.$get(undefined, {
    init: { cache: 'no-store', headers: initHeaders, signal: AbortSignal.timeout(5000) },
  });

  if (!res.ok) {
    throw new Error('同期ステータスの取得に失敗しました');
  }

  return res.json();
}
