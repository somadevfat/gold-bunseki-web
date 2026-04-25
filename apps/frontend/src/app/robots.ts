import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanda-dev.com";

/**
 * robots は検索エンジン向けの robots.txt 設定を生成する関数です。
 * @responsibility サイトのクロール制御とサイトマップの場所を定義する。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
