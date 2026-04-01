import { apiClient } from '../../../lib/api/client';

/**
 * getIndicators は直近発表された経済指標のリストを取得します。
 * @responsibility バックエンドAPIを呼び出し、RSCで使用するための指標リストを返却する。
 */
export async function getIndicators() {
  const res = await apiClient.api.v1.market.indicators.$get();

  if (!res.ok) {
    return { indicators: [] };
  }

  return res.json();
}
