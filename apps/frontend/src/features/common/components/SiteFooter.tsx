/**
 * SiteFooter はアプリケーション共通のフッターコンポーネントです。
 * @responsibility コピーライト表示とフッターナビゲーションリンクを提供する。
 */
export function SiteFooter() {
  return (
    <footer className="mt-40 pt-16 border-t border-slate-100 text-slate-400 text-xs flex flex-col xl:flex-row justify-between uppercase tracking-widest font-bold gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-900">&copy; 2026 Gold Volatility Analyzer</p>
      </div>
      <div className="flex flex-wrap gap-x-10 items-start">
        <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
          Privacy &amp; Security
        </span>
        <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
          Status
        </span>
        <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
          API
        </span>
      </div>
    </footer>
  );
}
