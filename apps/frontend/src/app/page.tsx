import { Suspense } from 'react';
import IndicatorSelector from '@/features/common/components/IndicatorSelector';
import { ReplayArea } from '@/features/market-replay/components/ReplayArea';
import ReplaySkeleton from '@/features/market-replay/components/ReplaySkeleton';
import { SessionFactTimeline } from '@/features/sessions/components/SessionFactTimeline';
import { getIndicators } from '@/features/common/api/getIndicators';
import { SiteHeader } from '@/features/common/components/SiteHeader';
import { SiteFooter } from '@/features/common/components/SiteFooter';

/**
 * DashboardPage はアプリケーションのメインダッシュボード画面です。
 * @responsibility 各機能（Market Replay, Session Timeline等）を統合し、RSC/Suspenseを活用したレイアウトを構成する。
 */

interface PageProps {
  searchParams: Promise<{ event?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  /* 指標一覧をバックエンドから動的に取得 */
  const { indicators } = await getIndicators();
  const defaultEvent = indicators.length > 0 ? indicators[0] : 'No Data';
  const currentEvent = resolvedParams.event || defaultEvent;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 flex flex-col items-center">
      <main className="w-full max-w-7xl px-4 sm:px-8 py-10 md:py-20 text-slate-900">

        {/* === 共通ヘッダー: タイトル・認証UI・ライブステータス === */}
        <SiteHeader />

        {/* === Primary Content: Market Event Context === */}
        <section className="mb-24 md:mb-32">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 px-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Market Event Context</h2>
            <IndicatorSelector indicators={indicators} />
          </div>

          <div className="bg-white border border-slate-100 rounded shadow-2xl shadow-slate-200/30 overflow-hidden">
            <Suspense key={currentEvent} fallback={<ReplaySkeleton />}>
              <ReplayArea eventName={currentEvent} displayEventName={currentEvent} />
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

        {/* === 共通フッター === */}
        <SiteFooter />
      </main>
    </div>
  );
}