'use client';

import { useIndicatorSelection } from '../hooks/useIndicatorSelection';

const INDICATORS = [
  { label: 'CPI', value: '消費者物価指数' },
  { label: 'コアCPI', value: 'コア消費者物価指数' },
  { label: '雇用統計', value: '非農業部門雇用者数' },
  { label: 'ISM製造業PMI', value: 'ISM製造業' },
  { label: 'ISM非製造業PMI', value: 'ISM非製造業' },
  { label: 'PPI', value: '生産者物価指数' },
  { label: 'コアPPI', value: 'コア生産者物価指数' },
  { label: '小売売上高', value: '小売売上高' },
  { label: 'GDP', value: 'GDP' },
  { label: '新規失業保険申請件数', value: '失業保険申請件数' },
];

/**
 * IndicatorSelector は経済指標を選択するためのタブUIコンポーネントです。
 * @responsibility 指標リストの表示と、選択時のURLパラメータ更新のトリガー。
 */
export default function IndicatorSelector() {
  const { currentEvent, selectIndicator } = useIndicatorSelection();

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-50 rounded-md border border-slate-100">
      {INDICATORS.map((ev) => (
        <button
          key={ev.value}
          onClick={() => selectIndicator(ev.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors
            ${
              currentEvent === ev.value
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
        >
          {ev.label}
        </button>
      ))}
    </div>
  );
}
