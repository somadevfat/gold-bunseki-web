"use client";

import { signIn, signOut, useSession } from "@/lib/auth";

/**
 * 認証UIコンポーネント (Client Component)
 * @responsibility 現在のログイン状態を表示し、ログイン・ログアウトアクションを提供する
 */
export function AuthUI() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div data-testid="auth-loading" className="text-sm text-slate-400">Loading auth...</div>;
  }

  if (session && session.user) {
    return (
      <div data-testid="auth-user" className="flex items-center gap-3">
        {session.user.image && (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-slate-200"
          />
        )}
        <span className="text-sm font-bold text-slate-700">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded hover:bg-slate-50 transition"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      data-testid="auth-signin-btn"
      onClick={() => signIn.social({ provider: "github" })}
      className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded hover:bg-slate-800 transition flex items-center gap-2"
    >
      GitHubでログイン
    </button>
  );
}
