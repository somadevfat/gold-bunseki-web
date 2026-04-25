import { getSessions } from '../api/getSessions';
import type { SessionVolatility } from '@/lib/api/client';

/**
 * SessionFactTimeline は過去のセッション別のボラティリティ実績をタイムライン形式で表示します。
 * @responsibility RSCとして過去データを取得し、日付ごとにグループ化してレンダリングする。
 */
export async function SessionFactTimeline() {
  const sessionsData = await getSessions();
  const sessions = (sessionsData?.sessions || []) as SessionVolatility[];

  if (sessions.length === 0) {
    return (
      <div className="px-4 py-8 text-center border border-dashed border-slate-200 rounded-lg">
        <p className="text-sm font-medium text-slate-400">データが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sessions.map((s, i) => {
        const isNewDate = i === 0 || s.date.split('T')[0] !== sessions[i - 1].date.split('T')[0];
        const dateStr = s.date.split('T')[0];
        const [y, m, d] = dateStr.split('-');

        return (
          <div key={i}>
            {isNewDate && (
              <div className="px-4 py-2 mt-8 mb-2 bg-slate-50/50 rounded inline-block">
                <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {m}月{d}日 <span className="text-slate-300 font-medium">{y}</span>
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded border border-transparent gap-4 select-none">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-300 tabular-nums w-12">
                  {s.startTimeJst?.substring(0, 5)}
                </span>
                <span className="text-sm md:text-base font-bold text-slate-700">{s.sessionName}</span>
              </div>
              <div className="flex items-center gap-8">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border
                    ${
                      s.condition === 'Large'
                        ? 'text-red-500 border-red-50 bg-white'
                        : s.condition === 'Mid'
                        ? 'text-amber-600 border-amber-50 bg-white'
                        : 'text-blue-600 border-blue-50 bg-white'
                    }`}
                >
                  {s.condition === 'Large' ? 'HIGH' : s.condition === 'Mid' ? 'MID' : 'LOW'}
                </span>
                <span className="text-base font-bold text-slate-900 tabular-nums w-16 text-right tracking-tighter">
                  ${s.volatilityPoints.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}