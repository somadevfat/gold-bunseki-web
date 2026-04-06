# 📜 プロジェクト憲法 (Project Ground Truth)

> [!IMPORTANT]
> このファイルはプロジェクトの技術スタック、アーキテクチャ、およびエンジニアリング基準の「唯一の真実」です。
> AIエージェントは常にこのファイルを最優先すること。

## 📍 1. 技術スタック (Standard Stack)

- **Runtime**: `Bun` (Node.js ではなく Bun を使用すること)
- **Backend (VPS)**: `TypeScript`, `Hono`, `Bun.serve`, `PostgreSQL` (Docker), `Nginx` (Reverse Proxy)
- **Frontend (Cloudflare Pages)**: `React 19`, `Next.js 15 (Vinext経由)`, `Tailwind CSS 4`
- **Analytics**: `Python` (Market Analysis Engine)

## 📍 1.5. アーキテクチャ・マップ (Architecture Map)

- **Backend API (VPS)**: `Hono` (Port 3000) / Bun.serve
- **Frontend (Cloudflare)**: `Next.js 15` (Port 3001) / Vinext
- **Database (VPS Docker)**: `PostgreSQL 16` (Port 5432)
- **Data Source (Local PC)**: `MetaTrader 5` (MT5) -> `Python` (Analysis)

## 📍 1.6. 標準コマンド (Standard Commands)

プロジェクトの操作はすべてルートの `Makefile` を経由すること。

- `make dev`: バックエンド・フロントエンドを同時起動（開発用）
- `make backend`: バックエンド API のみ起動
- `make frontend`: フロントエンドのみ起動
- `make db-migrate`: DBマイグレーション（PostgreSQL）の実行
- `make test`: バックエンドのテスト実行（カバレッジ確認含む）
- `make dev-mock`: モックサーバーモードでバックエンドを起動

## 📍 1.7. データフロー (Data Flow)

データの同期は、役割に応じて2つの独立した Python スクリプトと API エンドポイントを使用します。

1.  **初回シード (Seed)**: 
    - スクリプト: `apps/analytics/seed.py`
    - API: `POST /api/v1/sync/seed`
    - 内容: 過去数年分の大量のデータを一括で取得・解析し、バックエンド (PostgreSQL) へ初期投入します。
2.  **常用同期 (Incremental Sync)**: 
    - スクリプト: `apps/analytics/sync.py`
    - API: `POST /api/v1/sync/data`
    - 内容: 直近のデータ（数十分〜数時間分）のみを取得し、1分ごとの差分更新として高速にバックエンドへ送信します。
3.  **データソース**: MT5 の `GoldCalendarPush.mq5` が出力した JSON カレンダー (`%APPDATA%` 内) と、Python ライブラリ経由の 1分足価格データを自動マージします。
4.  **永続化**: バックエンドが `Drizzle ORM` を通じて `PostgreSQL` にデータを保存（UPSERT）します。

## 📍 2. アーキテクチャ (Architecture)

- **Backend**: `Clean Architecture` (Domain, Application, Interface, Infrastructure)。VPS上のBunで直接起動。
- **Frontend**: `Feature-based Architecture` (src/features/ 配下に UI, Hooks, API を垂直分割)。Cloudflare CDNから高速配信。
- **Communications**: `Hono Zod OpenAPI` による型安全な RPC 通信

## 📍 3. 品質基準 (Quality Standards)

- **Coverage**: **ロジック層のカバレッジ 100% を絶対条件とする。**
  - **Backend**: すべてのファイルで 100% (Line)
  - **Frontend**: `src/**/*.ts` (Logic/Hooks/API) で 100% (Line)
- **Testing Tools**:
  - **Logic**: `bun test`
  - **UI/E2E**: `Playwright`

## 📍 4. ドキュメンテーション

- **JSDoc**: すべての関数・クラスに `@responsibility` を必須とする。
- **ADR**: アーキテクチャの変更や決定の際は `docs/adr/` に記録すること。
