import { Suspense } from "react";
import { AuthUI } from "@/features/auth/components/AuthUI";
import { LiveStatusBadge } from "@/features/sessions/components/LiveStatusBadge";

/**
 * SiteHeader はアプリケーション共通のヘッダーコンポーネントです（RSC）。
 * @responsibility アプリタイトル、認証UI、ライブステータスバッジを統合して表示する。
 */
export async function SiteHeader() {
  return (
    <header className="mb-16 md:mb-24">
      {/* タイトルと認証UIを横並び */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl drop-shadow-sm select-none">💰</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Gold Volatility
          </h1>
        </div>

        <AuthUI />
      </div>

      {/* ライブステータスバッジ */}
      <div className="flex items-center gap-6 py-8 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Live Status
          </span>
          <Suspense fallback={<span className="text-slate-400 text-sm">Checking...</span>}>
            <LiveStatusBadge />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
