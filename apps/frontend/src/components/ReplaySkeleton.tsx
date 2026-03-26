"use client";

export default function ReplaySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Selector Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-slate-800 rounded-md"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5 h-[320px]">
          <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
          <div className="h-[200px] w-full bg-slate-800/50 rounded-lg"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
              <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
