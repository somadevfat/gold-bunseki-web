import type { Metadata } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const apiGroups = [
  {
    title: "Market API",
    description:
      "最新価格、セッション別ボラティリティ、指標リプレイ、ZigZag計算のためのAPIです。",
    paths: ["/api/v1/market/sessions", "/api/v1/market/replay", "/api/v1/market/indicators"],
  },
  {
    title: "Sync API",
    description:
      "MT5/Python同期サーバーから送られる価格・指標・セッション分析データを受け取るAPIです。",
    paths: ["/api/v1/sync/data", "/api/v1/sync/seed", "/api/v1/sync/status"],
  },
  {
    title: "Community API",
    description:
      "XAUUSD分析・GOLD分析の掲示板投稿、投稿詳細、返信を扱うAPIです。",
    paths: ["/api/v1/community/threads", "/api/v1/community/threads/{id}"],
  },
];

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "fanda-devのSwagger/OpenAPI仕様、主要API、同期API、掲示板APIへの導線をまとめたページです。",
  alternates: {
    canonical: "/api-docs",
  },
};

/**
 * ApiDocsPage はAPI仕様への導線と主要APIの概要を表示するページです。
 * @responsibility Swagger/OpenAPIの場所、主要APIの用途、利用できない場合の確認先を案内する。
 */
export default function ApiDocsPage() {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
          Developer Reference
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          API Documentation
        </h1>
        <p className="mt-5 text-base leading-8 text-slate-600">
          fanda-devのバックエンドAPIはHono Zod OpenAPIで定義されています。
          Swagger UIとOpenAPI JSONから、画面表示・同期・掲示板で使うAPI仕様を確認できます。
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`${apiBaseUrl}/swagger`}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Swagger UI
        </a>
        <a
          href={`${apiBaseUrl}/doc`}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400"
        >
          OpenAPI JSON
        </a>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {apiGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5"
          >
            <h2 className="text-base font-semibold text-slate-950">
              {group.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {group.description}
            </p>
            <ul className="mt-4 space-y-2 text-xs font-medium text-slate-500">
              {group.paths.map((path) => (
                <li key={path} className="rounded-lg bg-white px-3 py-2">
                  <code>{path}</code>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        APIドキュメントが開けない場合は、バックエンドが起動していること、
        `NEXT_PUBLIC_API_URL` が本番APIまたはローカルAPIを指していることを確認してください。
      </div>
    </section>
  );
}
