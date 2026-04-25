import "./globals.css";
import type { Metadata } from "next";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanda-dev.com");
const siteTitle = "Gold Volatility Analyzer | XAUUSD経済指標ボラティリティ分析";
const siteDescription =
  "Gold Volatility Analyzerは、XAUUSD（ゴールド）の経済指標前後の値動き、セッション別ボラティリティ、過去イベントの反応を確認できる分析ツールです。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | Gold Volatility Analyzer",
  },
  description: siteDescription,
  applicationName: "Gold Volatility Analyzer",
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
    siteName: "Gold Volatility Analyzer",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

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

