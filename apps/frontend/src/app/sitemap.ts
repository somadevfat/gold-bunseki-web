import type { MetadataRoute } from "next";
import { getInsightPosts } from "@/features/insights/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanda-dev.com";

/**
 * sitemap は検索エンジン向けのサイトマップを生成する関数です。
 * @responsibility サイト内の主要な URL 一覧を定義し、インデックス登録を補助する。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/api-docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/status`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  const insightRoutes: MetadataRoute.Sitemap = getInsightPosts().map((post) => ({
    url: `${siteUrl}/insights/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...insightRoutes];
}
