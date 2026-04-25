"use client";

import { useSession, signIn, signOut } from "@/lib/auth";

/**
 * useAuth は認証状態の管理とログイン・ログアウト操作を提供するカスタムフックです。
 * @responsibility ログイン状態の取得、Googleサインイン・サインアウトのアクション提供。
 * @return session セッション情報、isPending ローディング状態、handleSignIn・handleSignOut アクション関数
 */
export function useAuth() {
  const { data: session, isPending } = useSession();

  /* Googleサインイン処理：コールバックURLは現在のオリジンのルートへ */
  const handleSignIn = () => {
    signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    });
  };

  /* サインアウト処理 */
  const handleSignOut = () => {
    signOut();
  };

  return {
    session,
    isPending,
    handleSignIn,
    handleSignOut,
  };
}
