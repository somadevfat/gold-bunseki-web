import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanda-dev.com";

/**
 * sitemap は検索エンジン向けのサイトマップを生成する関数です。
 * @responsibility サイト内の主要な URL 一覧を定義し、インデックス登録を補助する。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
