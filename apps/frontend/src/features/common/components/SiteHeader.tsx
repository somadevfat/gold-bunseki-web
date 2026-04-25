import { Suspense } from "react";
import { AuthUI } from "@/features/auth/components/AuthUI";
import { LiveStatusBadge } from "@/features/sessions/components/LiveStatusBadge";

const navigationItems = [
  { href: "#overview", label: "Overview" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#market-replay", label: "Replay" },
  { href: "#session-timeline", label: "Timeline" },
  { href: "#status", label: "Status" },
];

/**
 * SiteHeader はアプリケーション共通のヘッダーコンポーネントです。
 * @responsibility アプリタイトル、認証UI、ライブステータスバッジを統合して表示する。
 */
export function SiteHeader() {
  return (
    <header className="mb-10 rounded-3xl border border-slate-200/80 bg-white/75 px-5 py-4 shadow-sm shadow-slate-200/50 backdrop-blur md:mb-12 md:px-6">
      {/* タイトルと認証UIを横並び */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold tracking-tight text-white">
            fd
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-700">
              fanda-dev.com
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              fanda-dev
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm"
          >
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-medium text-slate-500 transition-colors hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div id="status" className="scroll-mt-8">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Live
                </span>
                <Suspense fallback={<span className="text-slate-400 text-sm">Checking...</span>}>
                  <LiveStatusBadge />
                </Suspense>
              </div>
            </div>
            <AuthUI />
          </div>
        </div>
      </div>
    </header>
  );
}
