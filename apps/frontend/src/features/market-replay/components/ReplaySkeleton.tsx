'use client';

/**
 * ReplaySkeleton は再現データロード中のスケルトンスクリーンを提供します。
 * @responsibility ローディング状態の視覚的フィードバック。
 */
export default function ReplaySkeleton() {
  return (
    <div className="w-full space-y-10 p-6 md:p-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-12 py-8 border-y border-slate-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-50 rounded w-1/2"></div>
              <div className="h-6 bg-slate-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[480px] bg-slate-50 rounded-md"></div>
      <div className="grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-50 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
