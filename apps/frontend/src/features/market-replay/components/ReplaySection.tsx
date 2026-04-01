'use client';

import { useReplayChart } from '../hooks/useReplayChart';
import type { ReplayDataResponse } from '@/lib/api/client';

interface ReplaySectionProps {
  data: ReplayDataResponse;
  eventName: string;
}

/**
 * ReplaySection は特定指標の過去チャートと統計データを表示するメインコンポーネントです。
 * @responsibility データに基づいたプロパティ表示、チャート描画フックの呼び出し、統計サマリーの表示。
 * @note 型定義はバックエンドの OpenAPI スキーマから自動推論されたものを利用しています。
 */
export default function ReplaySection({ data, eventName }: ReplaySectionProps) {
  /* チャート描画ロジックをカスタムフックに委譲 */
  const { chartContainerRef } = useReplayChart({
    candles: data.candles || [],
    exactEventTimeJst: data.previousEvent?.exactEventTimeJst ?? undefined,
  });

  /* 統計データの総レコード数計算 */
  const totalStatsCount = data.historicalStats?.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0) || 0;

  return (
    <div className="w-full space-y-10 p-6 md:p-8">
      {/* ヘッダーエリア: 指標名と基本プロパティ */}
      <section>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-8">
          {eventName}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12 py-8 border-y border-slate-100">
          <PropertyItem
            label="Previous Date"
            value={
              data.previousEvent
                ? new Date(data.previousEvent.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'
            }
            subValue={data.previousEvent?.sessionName}
          />
          <PropertyItem
            label="Impact"
            value={data.previousEvent ? `$${data.previousEvent.volatilityPoints.toFixed(1)}` : '-'}
            highlight
          />
          <PropertyItem label="Sample Volume" value={`${totalStatsCount} Records`} />
          <PropertyItem label="Status" value="Active" isStatus />
        </div>
      </section>

      {/* メインチャートセクション */}
      <section className="bg-white border border-slate-200 rounded-md p-2 sm:p-4 shadow-sm">
        <div ref={chartContainerRef} className="h-[400px] sm:h-[480px] w-full relative">
          {/* データが存在しない場合のプレースホルダー */}
          {(!data.candles || data.candles.length === 0) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-slate-50/80 rounded backdrop-blur-sm shadow-inner">
              <span className="text-4xl mb-4 opacity-50">📭</span>
              <p className="text-slate-700 font-bold text-lg mb-2">チャートデータが存在しません</p>
              <div className="text-slate-500 text-sm max-w-md space-y-2">
                <p>
                  現在選択している指標 <strong>「{eventName}」</strong>{' '}
                  に紐付くチャートデータが見つかりませんでした。
                </p>
                <div className="bg-white p-3 rounded border border-slate-200 mt-4 text-left">
                  <p className="text-xs font-bold text-amber-600 mb-1">考えられる原因:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>MT5が経済指標データを提供していない口座である</li>
                    <li>MT5のカレンダー同期がまだ完了していない</li>
                    <li>該当の指標が過去数日間に一度も発表されていない</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 統計データセクション（地合い別平均） */}
      <section className="space-y-8">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
          Statistical Mean (Points)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.historicalStats?.map((stat: { condition: string; averageVola: number; count: number }, idx: number) => (
            <div
              key={idx}
              className={`p-8 rounded-lg bg-slate-50 border border-slate-100 transition-all
              ${stat.count > 0 ? 'opacity-100' : 'opacity-25'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border
                    ${
                      stat.condition === 'Large'
                        ? 'text-red-500 border-red-50 bg-white shadow-sm'
                        : stat.condition === 'Mid'
                        ? 'text-amber-600 border-amber-50 bg-white shadow-sm'
                        : 'text-blue-600 border-blue-50 bg-white shadow-sm'
                    }`}
                >
                  {stat.condition === 'Large' ? 'HIGH' : stat.condition === 'Mid' ? 'MID' : 'LOW'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {stat.count} samples
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1 tabular-nums tracking-tight">
                ${stat.averageVola.toFixed(1)}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Average</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* 内部補助コンポーネント: プロパティ表示項目 */
function PropertyItem({
  label,
  value,
  subValue,
  highlight,
  isStatus,
}: {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  isStatus?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap items-baseline gap-3">
        <p
          className={`text-xl font-bold tracking-tight ${
            highlight ? 'text-slate-900 border-b-2 border-slate-100 pb-1' : 'text-slate-700'
          } ${isStatus ? 'flex items-center gap-2' : ''}`}
        >
          {isStatus && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>}
          {value}
        </p>
        {subValue && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}