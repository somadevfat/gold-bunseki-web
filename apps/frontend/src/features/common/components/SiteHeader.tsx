"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthUI } from "@/features/auth/components/AuthUI";

const navigationItems = [
  { href: "/", label: "ダッシュボード" },
  { href: "/community", label: "掲示板" },
  { href: "/insights", label: "考察ブログ" },
];

/**
 * SiteHeader はアプリケーション共通のヘッダーコンポーネントです。
 * @responsibility アプリタイトル、ページナビゲーション、認証UIを統合して表示する。
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-10 rounded-3xl border border-slate-200/80 bg-white/75 px-5 py-4 shadow-sm shadow-slate-200/50 backdrop-blur md:mb-12 md:px-6">
      {/* タイトルと認証UIを横並び */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[-0.03em] text-slate-950 transition-colors hover:text-amber-700"
        >
          fanda-dev.com
        </Link>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`font-medium transition-colors hover:text-slate-950 ${
                  pathname === item.href ? "text-slate-950" : "text-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AuthUI />
          </div>
        </div>
      </div>
    </header>
  );
}
