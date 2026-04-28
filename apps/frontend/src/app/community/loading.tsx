/**
 * CommunityLoading は掲示板ページの読み込み状態を表示します。
 * @responsibility 投稿一覧APIの応答待ち中にユーザーへ進行中であることを伝える。
 */
export default function CommunityLoading() {
  return (
    <section className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
      <div className="space-y-5">
        <div className="h-3 w-40 animate-pulse rounded bg-amber-100" />
        <div className="h-24 max-w-md animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-20 max-w-lg animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div className="space-y-3">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </section>
  );
}
