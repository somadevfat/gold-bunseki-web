import "./globals.css";

export const metadata = {
  title: "Gold Volatility Analyzer",
  description: "ゴールド（XAUUSD）のボラティリティを経済指標ごとに分析・可視化するツールです。",
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

