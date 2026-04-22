"use client";

import { useAuth } from "../hooks/useAuth";

/**
 * AuthUI は認証UIコンポーネント (Client Component) です。
 * @responsibility 現在のログイン状態を表示し、ログイン・ログアウトアクションを提供する。
 *                 ロジックは useAuth フックに委譲する。
 */
export function AuthUI() {
  /* 認証ロジックをカスタムフックに委譲 */
  const { session, isPending, handleSignIn, handleSignOut } = useAuth();

  if (isPending) {
    return (
      <div data-testid="auth-loading" className="text-sm text-slate-400 animate-pulse">
        読み込み中...
      </div>
    );
  }

  if (session && session.user) {
    return (
      <div
        data-testid="auth-user"
        className="flex items-center gap-2 p-1 pr-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-slate-100 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
            {session.user.name?.[0]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[11px] leading-tight text-slate-500 font-medium px-1">
            ログイン中
          </span>
          <span className="text-xs font-bold text-slate-800 px-1 truncate max-w-[120px]">
            {session.user.name}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group relative"
          title="ログアウト"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      data-testid="auth-signin-btn"
      onClick={handleSignIn}
      className="group relative flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg shadow-sm hover:bg-white hover:border-slate-300 hover:shadow-md active:scale-[0.98] transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-center justify-center w-5 h-5">
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
            fill="#EA4335"
          />
        </svg>
      </div>
      <span>Google でログイン</span>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
