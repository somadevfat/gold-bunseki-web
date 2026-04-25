import Link from 'next/link';

/**
 * NotFound は存在しないページへのアクセス時に表示されるUIコンポーネントです。
 * @responsibility 404エラー時にユーザーへ適切なフィードバックとホームへのリンクを提供する。
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="p-4 mb-4 bg-slate-100 rounded-full text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-800">ページが見つかりません</h2>
      <p className="mb-6 text-slate-600">お探しのページは削除されたか、名前が変更されたか、一時的に利用できない可能性があります。</p>
      <Link 
        href="/"
        className="px-6 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
      >
        トップページに戻る
      </Link>
    </div>
  );
}

