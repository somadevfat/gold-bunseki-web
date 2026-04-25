import "./globals.css";
import type { Metadata } from "next";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanda-dev.com");
const siteTitle = "fanda-dev | XAUUSD分析・GOLD分析ダッシュボード";
const siteDescription =
  "fanda-devは、XAUUSD（ゴールド）の経済指標前後の値動き、セッション別ボラティリティ、過去イベントの反応を確認できるGOLD分析ダッシュボードです。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | fanda-dev",
  },
  description: siteDescription,
  applicationName: "fanda-dev",
  keywords: ["XAUUSD分析", "GOLD分析", "ゴールド分析", "経済指標", "ボラティリティ分析"],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: "fanda-dev",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

/**
 * RootLayout はアプリケーション全体の共通レイアウトを定義するコンポーネントです。
 * @responsibility HTML 構造の定義、SEO メタデータの管理、およびグローバルスタイルの適用を行う。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

