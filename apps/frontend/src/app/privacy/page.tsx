import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Security",
  description:
    "fanda-devのプライバシー、Cookie、Google認証、データ同期、セキュリティ方針を説明します。",
  alternates: {
    canonical: "/privacy",
  },
};

const policySections = [
  {
    title: "収集する情報",
    body: "Googleログイン時のアカウント識別情報、掲示板投稿、リサーチメモ、サービス改善に必要なアクセス情報を扱います。",
  },
  {
    title: "利用目的",
    body: "認証、投稿やメモの保存、XAUUSD分析・GOLD分析の利用体験改善、不正利用の防止に利用します。",
  },
  {
    title: "Cookieと認証",
    body: "ログイン状態の維持とセッション保護のためにCookieを使用します。認証処理はbetter-authとGoogle OAuthを利用します。",
  },
  {
    title: "市場データと同期",
    body: "MT5から取得した価格データや経済指標データは分析表示のために保存され、個人を特定する目的では利用しません。",
  },
  {
    title: "セキュリティ",
    body: "APIは同期用Bearer token、CORS制御、セキュリティヘッダー、サーバーログにより保護と原因調査を行います。",
  },
  {
    title: "問い合わせ",
    body: "プライバシーやセキュリティに関する確認は、GitHubリポジトリのIssueまたは管理者連絡先から相談できます。",
  },
];

/**
 * PrivacyPage はプライバシーとセキュリティ方針を表示するページです。
 * @responsibility 収集情報、利用目的、Cookie/認証、同期データ、問い合わせ先を利用者へ説明する。
 */
export default function PrivacyPage() {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
          Trust Center
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
          Privacy &amp; Security
        </h1>
        <p className="mt-5 text-base leading-8 text-slate-600">
          fanda-devは、XAUUSD分析・GOLD分析のために必要な情報だけを扱い、
          認証情報と投稿データを安全に管理することを重視します。
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {policySections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5"
          >
            <h2 className="text-base font-semibold text-slate-950">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {section.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
