import { Suspense } from 'react';
import IndicatorSelector from '@/features/common/components/IndicatorSelector';
import { ReplayArea } from '@/features/market-replay/components/ReplayArea';
import ReplaySkeleton from '@/features/market-replay/components/ReplaySkeleton';
import { SessionFactTimeline } from '@/features/sessions/components/SessionFactTimeline';
import { getIndicators } from '@/features/common/api/getIndicators';
import { LiveStatusBadge } from '@/features/sessions/components/LiveStatusBadge';
import { ResearchNoteForm } from '@/features/forms/components/ResearchNoteForm';

const valueHighlights = [
  {
    title: 'XAUUSD分析',
    description: '経済指標前後のゴールドの値動きを、リプレイで振り返る。',
  },
  {
    title: 'GOLD分析',
    description: '東京・ロンドン・NYのセッション別に、荒れやすい時間帯を整理する。',
  },
  {
    title: '指標リサーチ',
    description: '雇用統計やCPIなど、過去イベントの反応を次の準備に使う。',
  },
];

const workflowSteps = [
  '指標を選ぶ',
  '発表前後の値動きを見る',
  'セッションの荒れ方を確認する',
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
    <>
      <section id="overview" className="mb-8 scroll-mt-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <div className="space-y-10 p-6 sm:p-8 lg:p-10">
              <div className="max-w-4xl space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700">
                  XAUUSD analysis / GOLD analysis
                </p>
                <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 md:text-6xl">
                  指標発表時のボラティリティを把握し、無理なエントリーを減らす。
                </h2>
                <p className="max-w-2xl text-base leading-8 text-slate-600">
                  fanda-devは、XAUUSDの経済指標発表前後の値動きとセッション別ボラティリティを整理し、トレード戦略を立てる手間を軽くするアプリです。相場が安定しない時間帯を事前に見極め、手を出さない判断にも使えます。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <div key={step} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-4">
                    <p className="mb-3 text-xs font-semibold text-amber-700">0{index + 1}</p>
                    <p className="text-sm font-semibold text-slate-900">{step}</p>
                  </div>
                ))}
              </div>

              <a
                href="#dashboard"
                className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                ダッシュボードを見る
              </a>
            </div>

            <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-8">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Research Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  検索流入では「XAUUSD分析」「GOLD分析」で見つけてもらい、画面上ではすぐ分析に入れる構成にしています。
                </p>
              </div>
              <div className="grid gap-3">
                {valueHighlights.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <h3 className="mb-2 text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-slate-300">{item.description}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="dashboard" className="scroll-mt-8">
          <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-200/50 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                Analysis Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                XAUUSD / GOLD 分析
              </h2>
            </div>
            <IndicatorSelector indicators={indicators} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* === Primary Content: Market Event Context === */}
            <section id="market-replay" className="scroll-mt-8">
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                      Market Replay
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      指標発表前後の値動き
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-500">{currentEvent}</p>
                    <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Live
                      </span>
                      <Suspense fallback={<span className="text-slate-400 text-sm">Checking...</span>}>
                        <LiveStatusBadge />
                      </Suspense>
                    </div>
                  </div>
                </div>
                <Suspense key={currentEvent} fallback={<ReplaySkeleton />}>
                  <ReplayArea eventName={currentEvent} displayEventName={currentEvent} />
                </Suspense>
              </div>
            </section>

            {/* === Secondary Content: Session Fact Timeline === */}
            <aside id="session-timeline" className="scroll-mt-8">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Session Timeline
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">
                      セッション別の反応
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      イベントと時間帯の関係を横で見ながら、チャートの動きを確認できます。
                    </p>
                  </div>
                  <Suspense
                    fallback={
                      <div className="animate-pulse space-y-4 pt-4">
                        <div className="h-10 rounded bg-slate-100"></div>
                        <div className="h-10 rounded bg-slate-100"></div>
                      </div>
                    }
                  >
                    <SessionFactTimeline />
                  </Suspense>
                </div>
                <ResearchNoteForm />
              </div>
            </aside>
          </div>
      </section>
    </>
  );
}