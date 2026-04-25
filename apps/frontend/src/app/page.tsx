import { Suspense } from 'react';
import IndicatorSelector from '@/features/common/components/IndicatorSelector';
import { ReplayArea } from '@/features/market-replay/components/ReplayArea';
import ReplaySkeleton from '@/features/market-replay/components/ReplaySkeleton';
import { SessionFactTimeline } from '@/features/sessions/components/SessionFactTimeline';
import { getIndicators } from '@/features/common/api/getIndicators';
import { SiteHeader } from '@/features/common/components/SiteHeader';
import { SiteFooter } from '@/features/common/components/SiteFooter';

const valueHighlights = [
  {
    title: 'Event replay',
    description: '米雇用統計やCPIなど、経済指標発表前後のXAUUSDの値動きをリプレイで確認。',
  },
  {
    title: 'Session context',
    description: '東京・ロンドン・NYなど、セッション別のボラティリティとイベント影響を整理。',
  },
  {
    title: 'Trade prep',
    description: '過去の反応を見ながら、指標前後の値動きの傾向を事前に確認。',
  },
];

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
    <div className="flex min-h-screen flex-col items-center bg-[#fbfaf7] text-slate-900 selection:bg-amber-100">
      <main className="w-full max-w-7xl px-4 py-8 text-slate-900 sm:px-8 md:py-14">

        {/* === 共通ヘッダー: タイトル・認証UI・ライブステータス === */}
        <SiteHeader />

        <section id="overview" className="mb-16 scroll-mt-8 md:mb-24">
          <div className="grid gap-10 border-b border-slate-200/70 pb-14 md:grid-cols-[1.25fr_0.75fr] md:pb-20">
            <div className="space-y-9">
              <div className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  XAUUSD Volatility Research
                </p>
                <div className="space-y-4">
                  <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 md:text-6xl">
                    ゴールドの指標反応を、落ち着いて振り返るための分析ダッシュボード。
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-slate-600">
                    XAUUSDの経済指標前後の値動き、セッション別の荒れ方、過去イベントの反応を一画面で確認できます。派手なシグナルではなく、次の判断材料を増やすためのリサーチツールです。
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="#market-replay"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  分析チャートを見る
                </a>
                <a
                  href="#session-timeline"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  セッション反応を見る
                </a>
              </div>
            </div>

            <div className="grid content-start gap-3">
              {valueHighlights.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200/80 bg-white/70 p-5">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Primary Content: Market Event Context === */}
        <section id="market-replay" className="mb-24 md:mb-32 scroll-mt-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 px-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Market Event Context</h2>
            <IndicatorSelector indicators={indicators} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <Suspense key={currentEvent} fallback={<ReplaySkeleton />}>
              <ReplayArea eventName={currentEvent} displayEventName={currentEvent} />
            </Suspense>
          </div>
        </section>

        {/* === Secondary Content: Session Fact Timeline === */}
        <section id="session-timeline" className="border-t border-slate-100 pt-20 max-w-4xl scroll-mt-8">
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