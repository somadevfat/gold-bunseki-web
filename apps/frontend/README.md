# Gold Vola Bunseki Frontend

## 開発サーバー

バックエンドへ接続して開発する場合:

```zsh
bun run dev
```

フロントエンドだけで画面確認する場合:

```zsh
bun run dev:mock
```

`dev:mock` は `NEXT_PUBLIC_USE_MOCK_API=true` を設定し、`src/lib/api/mockClient.ts` の固定レスポンスを使います。バックエンド、DB、認証を起動せずに、掲示板投稿・マーケットセッション・指標一覧・再現データの画面確認ができます。

## モックシナリオ

追加で `NEXT_PUBLIC_MOCK_API_SCENARIO` を指定すると、代表的な状態を確認できます。

```zsh
NEXT_PUBLIC_MOCK_API_SCENARIO=empty bun run dev:mock
NEXT_PUBLIC_MOCK_API_SCENARIO=error bun run dev:mock
```

モックは HTTP を横取りせず、`apiClient` の実装を差し替えます。vinext と Service Worker の相性に依存しないため、日常のフロントエンド確認用として使います。
