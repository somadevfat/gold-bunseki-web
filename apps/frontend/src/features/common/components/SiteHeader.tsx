import { Suspense } from "react";
import { AuthUI } from "@/features/auth/components/AuthUI";
import { LiveStatusBadge } from "@/features/sessions/components/LiveStatusBadge";

const navigationItems = [
  { href: "#overview", label: "Overview" },
  { href: "#market-replay", label: "Market Replay" },
  { href: "#session-timeline", label: "Timeline" },
  { href: "#status", label: "Status" },
];

/**
 * SiteHeader はアプリケーション共通のヘッダーコンポーネントです。
 * @responsibility アプリタイトル、認証UI、ライブステータスバッジを統合して表示する。
 */
export function SiteHeader() {
  return (
    <header className="mb-12 border-b border-slate-200/70 pb-6 md:mb-16">
      {/* タイトルと認証UIを横並び */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold tracking-tight text-slate-900 shadow-sm">
            GV
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
              XAUUSD Research
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              Gold Volatility
            </h1>
          </div>
        </div>

        <AuthUI />
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm"
      >
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="border-b border-transparent pb-1 font-medium text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-950"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ライブステータスバッジ */}
      <div id="status" className="flex items-center gap-6 pt-6 scroll-mt-8">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
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
