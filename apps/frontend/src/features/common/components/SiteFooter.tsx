import Link from "next/link";

/**
 * SiteFooter はアプリケーション共通のフッターコンポーネントです。
 * @responsibility コピーライト表示とフッターナビゲーションリンクを提供する。
 */
export function SiteFooter() {
  return (
    <footer className="mt-32 flex flex-col justify-between gap-8 border-t border-slate-200/70 pt-10 text-xs text-slate-400 xl:flex-row">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-800">&copy; 2026 fanda-dev</p>
        <p className="max-w-md leading-6">
          XAUUSD分析・GOLD分析のためのリサーチダッシュボード。
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 font-medium">
        <Link href="/privacy" className="border-b border-transparent pb-1 transition-colors hover:border-slate-900 hover:text-slate-900">
          Privacy &amp; Security
        </Link>
        <Link href="/status" className="border-b border-transparent pb-1 transition-colors hover:border-slate-900 hover:text-slate-900">
          Status
        </Link>
        <Link href="/api" className="border-b border-transparent pb-1 transition-colors hover:border-slate-900 hover:text-slate-900">
          API
        </Link>
      </div>
    </footer>
  );
}
