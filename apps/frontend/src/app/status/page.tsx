import type { Metadata } from "next";
import { getSyncStatus } from "@/features/sync/api/getSyncStatus";
import type { SyncStatusResponse } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Status",
  description:
    "fanda-devのバックエンドAPI、同期ステータス、最終更新時刻を確認できるステータスページです。",
  alternates: {
    canonical: "/status",
  },
};

/**
 * formatDateTime は日時文字列を日本時間の読みやすい形式に変換します。
 * @responsibility 空値や不正値を扱いながら、ja-JP ロケールで日時を整形する。
 */
function formatDateTime(value: string) {
  if (!value) {
    return "未取得";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

/**
 * getHealthView は同期状態に応じた表示用データを返します。
 * @responsibility ステータス文字列をラベル、説明文、Tailwind クラスにマッピングする。
 */
function getHealthView(syncHealth: string) {
  const normalized = syncHealth.toLowerCase();

  if (normalized === "healthy") {
    return {
      label: "Healthy",
      description: "バックエンドは同期データを正常に参照できます。",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dotClassName: "bg-emerald-500",
    };
  }

  if (normalized === "stale") {
    return {
      label: "Stale",
      description: "同期データの更新が遅れている可能性があります。",
      className: "border-amber-200 bg-amber-50 text-amber-900",
      dotClassName: "bg-amber-500",
    };
  }

  return {
    label: syncHealth || "Unknown",
    description: "同期状態を確認できませんでした。",
    className: "border-rose-200 bg-rose-50 text-rose-900",
    dotClassName: "bg-rose-500",
  };
}

/**
 * buildStatusItems は同期ステータスレスポンスを表示用の項目配列に変換します。
 * @responsibility 各ステータス項目のラベル、フォーマット済み値、説明文を整理する。
 */
function buildStatusItems(status: SyncStatusResponse) {
  return [
    {
      label: "Latest Candle",
      value: formatDateTime(status.lastCandleAt),
      description: "価格足データの最終同期時刻",
    },
    {
      label: "Latest Session",
      value: formatDateTime(status.lastSessionAt),
      description: "セッション集計データの最終更新日",
    },
    {
      label: "Latest Event",
      value: formatDateTime(status.lastEventAt),
      description: "経済指標データの最終同期時刻",
    },
    {
      label: "Stored Candles",
      value: status.totalCandles.toLocaleString("ja-JP"),
      description: "バックエンドで確認できる価格足件数",
    },
  ];
}

type StatusContentProps = {
  status: SyncStatusResponse | null;
  errorMessage?: string;
};

/**
 * StatusContent はバックエンドと同期データの現在状態を表示するコンポーネントです。
 * @responsibility 正常時と取得失敗時の表示内容を出し分ける。
 */
export function StatusContent({ status, errorMessage = "" }: StatusContentProps) {
  const health = getHealthView(status?.syncHealth ?? "Unknown");

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
            Service Status
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Status
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            バックエンドAPIと、画面表示に使う価格・セッション・経済指標データの同期状態を確認できます。
          </p>
        </div>

        <div className={`w-full rounded-2xl border p-5 lg:max-w-sm ${health.className}`}>
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${health.dotClassName}`} />
            <p className="text-sm font-semibold">{health.label}</p>
          </div>
          <p className="mt-3 text-sm leading-6">{health.description}</p>
        </div>
      </div>

      {status ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {buildStatusItems(status).map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-7 text-rose-950">
          {errorMessage || "同期ステータスの取得に失敗しました"}
          。時間を置いて再読み込みし、解消しない場合はバックエンドAPIの起動状態を確認してください。
        </div>
      )}
    </section>
  );
}

/**
 * StatusPage はステータスページのルートコンポーネントです。
 * @responsibility 同期ステータスを取得し、StatusContent に渡して表示する。
 */
export default async function StatusPage() {
  let status: SyncStatusResponse | null = null;
  let errorMessage = "";

  try {
    status = await getSyncStatus();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "同期ステータスの取得に失敗しました";
  }

  return <StatusContent status={status} errorMessage={errorMessage} />;
}
