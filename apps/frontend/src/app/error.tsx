'use client';

import { useEffect } from 'react';

/**
 * Root Error Boundary
 * @responsibility アプリケーション全体でのパニック・致命的エラーをキャッチし、復旧手段を提供する。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 実際にはここで Sentry などにエラーを飛ばす
    console.error('Captured by Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">問題が発生しました</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          データの取得中にエラーが発生しました。時間を置いて再度お試しください。
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
