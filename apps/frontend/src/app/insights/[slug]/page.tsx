import type { Metadata } from "next";
import Link from "next/link";
import { getInsightPostBySlug } from "@/features/insights/content";

type InsightDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * generateMetadata は考察記事詳細のメタ情報を生成します。
 * @responsibility 記事タイトルと説明文をSEO metadataへ反映する。
 */
export async function generateMetadata({ params }: InsightDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsightPostBySlug(slug);

  if (!post) {
    return {
      title: "記事が見つかりません",
      description: "指定された考察ブログ記事は見つかりませんでした。",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/insights/${post.slug}`,
    },
  };
}

/**
 * InsightDetailPage は考察ブログの記事詳細を表示します。
 * @responsibility slugに対応する記事本文と存在しない記事の案内を表示する。
 */
export default async function InsightDetailPage({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const post = getInsightPostBySlug(slug);

  if (!post) {
    return (
      <section className="space-y-5 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Insight Blog</p>
        <h1 className="text-2xl font-semibold text-red-950">記事が見つかりません</h1>
        <p className="text-sm leading-6 text-red-800">
          指定された記事は存在しないか、公開が終了しています。考察ブログ一覧から記事を選び直してください。
        </p>
        <Link href="/insights" className="inline-flex rounded-xl bg-red-950 px-4 py-2 text-sm font-semibold text-white">
          考察ブログ一覧へ戻る
        </Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 lg:p-10">
      <Link href="/insights" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
        考察ブログ一覧へ戻る
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{post.category}</p>
      <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">{post.title}</h1>
      <time className="mt-4 block text-xs font-medium text-slate-400" dateTime={post.publishedAt}>
        {new Intl.DateTimeFormat("ja-JP", {
          dateStyle: "medium",
          timeZone: "Asia/Tokyo",
        }).format(new Date(post.publishedAt))}
      </time>
      <p className="mt-6 text-base leading-8 text-slate-600">{post.description}</p>
      <div className="mt-8 space-y-6 border-t border-slate-100 pt-8">
        {post.body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-9 text-slate-700">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
