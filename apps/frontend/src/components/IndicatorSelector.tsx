"use client";

import { useRouter, useSearchParams } from "next/navigation";

const INDICATORS = [
  "CPI", "コアCPI", "雇用統計", "ISM製造業PMI", "ISM非製造業PMI", 
  "PPI", "コアPPI", "小売売上高", "GDP", "新規失業保険申請件数"
];

/*
 * IndicatorSelector は URL のクエリパラメータ (?event=...) を操作するクライアントコンポーネント。
 */
export default function IndicatorSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentEvent = searchParams.get("event") || "ISM製造業PMI";

  const handleSelect = (eventName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", eventName);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {INDICATORS.map((ev) => (
        <button
          key={ev}
          onClick={() => handleSelect(ev)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border
            ${currentEvent === ev 
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40" 
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 font-normal"}`}
        >
          {ev}
        </button>
      ))}
    </div>
  );
}
