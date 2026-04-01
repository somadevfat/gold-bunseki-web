import { Suspense } from 'react';
import IndicatorSelector from '@/features/common/components/IndicatorSelector';
import { ReplayArea } from '@/features/market-replay/components/ReplayArea';
import ReplaySkeleton from '@/features/market-replay/components/ReplaySkeleton';
import { LiveStatusBadge } from '@/features/sessions/components/LiveStatusBadge';
import { SessionFactTimeline } from '@/features/sessions/components/SessionFactTimeline';

/**
 * DashboardPage はアプリケーションのメインダッシュボード画面です。
 * @responsibility 各機能（Market Replay, Session Timeline等）を統合し、RSC/Suspenseを活用したレイアウトを構成する。
 */

interface PageProps {
  searchParams: Promise<{ event?: string }>;
}

const INDICATOR_LABELS: Record<string, string> = {
  消費者物価指数: 'CPI',
  コア消費者物価指数: 'コアCPI',
  非農業部門雇用者数: '雇用統計',
  ISM製造業: 'ISM製造業PMI',
  ISM非製造業: 'ISM非製造業PMI',
  生産者物価指数: 'PPI',
  コア生産者物価指数: 'コアPPI',
  小売売上高: '小売売上高',
  GDP: 'GDP',
  失業保険申請件数: '新規失業保険申請件数',
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentEvent = resolvedParams.event || 'ISM製造業';
  const displayEventName = INDICATOR_LABELS[currentEvent] || currentEvent;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 flex flex-col items-center">
      <main className="w-full max-w-7xl px-4 sm:px-8 py-10 md:py-20 text-slate-900">
        {/* === Header === */}
        <header className="mb-16 md:mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <span className="text-4xl drop-shadow-sm select-none">💰</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Gold Volatility
            </h1>
          </div>

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

        {/* === Primary Content: Market Event Context === */}
        <section className="mb-24 md:mb-32">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 px-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Market Event Context</h2>
            <IndicatorSelector />
          </div>

          <div className="bg-white border border-slate-100 rounded shadow-2xl shadow-slate-200/30 overflow-hidden">
            <Suspense key={currentEvent} fallback={<ReplaySkeleton />}>
              <ReplayArea eventName={currentEvent} displayEventName={displayEventName} />
            </Suspense>
          </div>
        </section>

        {/* === Secondary Content: Session Fact Timeline === */}
        <section className="border-t border-slate-100 pt-20 max-w-4xl">
          <div className="space-y-10">
            <div className="px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">
                Session Fact Timeline
              </h3>
              <Suspense
                fallback={
                  <div className="animate-pulse space-y-4 pt-4">
                    <div className="h-10 bg-slate-100 rounded w-full"></div>
                    <div className="h-10 bg-slate-100 rounded w-full"></div>
                  </div>
                }
              >
                <SessionFactTimeline />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Global Footer */}
        <footer className="mt-40 pt-16 border-t border-slate-100 text-slate-400 text-xs flex flex-col xl:flex-row justify-between uppercase tracking-widest font-bold gap-12">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-900">&copy; 2026 Gold Volatility Analyzer</p>
          </div>
          <div className="flex flex-wrap gap-x-10 items-start">
            <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
              Privacy & Security
            </span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
              Status
            </span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors border-b border-transparent hover:border-slate-900 pb-1">
              API
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}