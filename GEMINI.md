# 📜 プロジェクト憲法 (Project Ground Truth)

> [!IMPORTANT]
> このファイルはプロジェクトの技術スタック、アーキテクチャ、およびエンジニアリング基準の「唯一の真実」です。
> AIエージェントは常にこのファイルを最優先し、いかなる場合も古いスタック（Go, Postgres, Vite単体など）を提案・採用してはいけません。

## 📍 1. 技術スタック (Standard Stack)

- **Runtime**: `Bun` (Node.js ではなく Bun を使用すること)
- **Backend**: `TypeScript`, `Hono`, `Cloudflare D1` (SQLite)
- **Frontend**: `React 19`, `Next.js 15 (Vinext経由)`, `Tailwind CSS 4`
- **Analytics**: `Python` (Market Analysis Engine)

## 📍 2. アーキテクチャ (Architecture)

- **Backend**: `Clean Architecture` (Domain, Application, Interface, Infrastructure)
- **Frontend**: `Feature-based Architecture` (src/features/ 配下に UI, Hooks, API を垂直分割)
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
