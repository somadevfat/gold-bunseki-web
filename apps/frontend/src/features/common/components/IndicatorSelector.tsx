'use client';

import { useIndicatorSelection } from '../hooks/useIndicatorSelection';

interface IndicatorSelectorProps {
  indicators: string[];
}

/**
 * IndicatorSelector は経済指標を選択するためのタブUIコンポーネントです。
 * @responsibility 指標リストの表示と、選択時のURLパラメータ更新のトリガー。
 */
export default function IndicatorSelector({ indicators }: IndicatorSelectorProps) {
  // リストが空の場合は安全に処理をフォールバックする
  const defaultIndicator = indicators.length > 0 ? indicators[0] : 'No Data';
  const { currentEvent, selectIndicator } = useIndicatorSelection(defaultIndicator);

  // UIで表示しやすいように整形するヘルパー関数
  // 例: "[USD] ISM製造業PMI" -> "ISM製造業PMI" と表示を簡略化する（ただし必要であれば）
  // 今回はそのまま表示するが、整形が必要な場合はここで行う
  const formatLabel = (val: string) => val;

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded-md border border-slate-100 max-w-full overflow-x-auto">
      {indicators.length === 0 ? (
        <span className="px-3 py-1.5 text-xs text-slate-400">指標データがありません</span>
      ) : (
        indicators.map((indicatorName) => (
          <button
            key={indicatorName}
            onClick={() => selectIndicator(indicatorName)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap
              ${
                currentEvent === indicatorName
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
          >
            {formatLabel(indicatorName)}
          </button>
        ))
      )}
    </div>
  );
}
