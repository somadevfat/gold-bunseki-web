import { getSessions } from '../api/getSessions';

/**
 * LiveStatusBadge は現在のマーケットのボラティリティ状況をリアルタイム（Fetch時）に表示するバッジです。
 * @responsibility RSCとしてデータを取得し、地合いに応じたスタイルで状況を表示する。
 */
export async function LiveStatusBadge() {
  const sessionsData = await getSessions();
  const currentCondition = sessionsData?.currentCondition || 'Unknown';

  return (
    <span
      className={`text-base font-bold flex items-center gap-3
       ${
         currentCondition === 'Large'
           ? 'text-red-500'
           : currentCondition === 'Mid'
           ? 'text-amber-600'
           : 'text-blue-600'
       }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          currentCondition === 'Large'
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
            : currentCondition === 'Mid'
            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
            : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
        } animate-pulse`}
      ></span>
      {currentCondition === 'Large'
        ? 'HIGH VOLATILITY'
        : currentCondition === 'Mid'
        ? 'NORMAL MARKET'
        : 'LOW VOLATILITY'}
    </span>
  );
}