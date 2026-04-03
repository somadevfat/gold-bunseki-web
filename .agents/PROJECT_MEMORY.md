# 🧠 Project Memory (長期記憶)

このファイルは、AIエージェントがプロジェクトの文脈や進行状況を維持するための作業記録（長期記憶）です。
**作業完了ごとのスキル実行によって更新・追記されます。**

## 🏗️ 最近の作業ログ (Recent Work Logs)

### 2026-04-03 - バックエンドおよびフロントエンドのテストカバレッジ 100.00% 達成

- **達成したタスク**:
  - **Backend (Hono/D1)**: 全ファイルのラインカバレッジ 100% を達成。
    - Repository (D1Price, D1Session, D1ZigZag, D1Batch), Controller (Market, Sync), External (AnalyticsService) のテストを完備。
    - `apiIntegration.test.ts` における `Stale` 判定（24時間経過）によるテスト失敗を、`new Date()` を用いた動的なデータ生成に修正し、環境に依存しない安定したテストを実現。
  - **Frontend (Next.js/Vinext)**: ロジック層（API通信, カスタムフック, APIクライアント）のラインカバレッジ 100% を達成。
    - `bun test` を使用した高速なテスト実行環境を整備。
    - Playwright (E2E) と `bun test` (Unit) の競合を `bunfig.toml` の `exclude` 設定で解消。
  - **Architecture**: `architecture.md` を更新し、フロントエンドの Feature-based 構成（Features/Common/Components/Hooks/API）を明文化。
- **対応したバグ**: `D1SyncRepository` における `Healthy/Stale` 判定ロジックがテスト実行時刻に依存していた問題を修正。実装は変えず、テスト側のモックデータを「実行時の現在時刻」から相対的に生成するように改善。
- **次回への申し送り事項**:
  - 今後はこの 100% カバレッジを維持するため、機能追加時に必ずテストを同梱すること。
  - UIコンポーネント（`.tsx`）は Playwright でのカバーに留める方針を継続。

### 2026-04-02 - 外部データ同期(Push)用DTOの導入、デプロイ手順整備、および設計ドキュメントの最新化

- **達成したタスク**:
  - `Makefile` の整備 (`clean` ターゲットのポート番号修正、`lint`/`test`/`dev-mock` の追加、日本語コメント化)。
  - `DEPLOYMENT.md` の作成（Cloudflare D1およびWorkersへのバックエンド・フロントエンドのデプロイ手順の網羅と解説の追加）。
  - バックエンドAPI (`/api/v1/sync/data`) におけるZodバリデーションエラーの修正。厳密なEntityスキーマ(`SessionVolatilitySchema`等)を直接使うのではなく、Pythonの生データ形式に合わせたPOST受取専用のDTOスキーマ(`SyncSessionDtoSchema`等)を `openapi.ts` に新設。
  - 上記のDTO導入に関するアーキテクチャ・ディシジョン・レコード(ADR)を `docs/adr/0001-separate-sync-dto-from-domain-entities.md` として作成。
  - `docs/REQUIREMENTS.md` と `architecture.md` の記述が古いスタック (Go, Postgres, Next.js) になっていたため、現在の最新構成 (Hono, Cloudflare D1, vinext) に合わせて修正。
- **対応したバグ**: Python分析エンジン(EA)からHonoへのPOST同期時に発生していたZodエラー（`id`, `condition` の欠如、日付形式の不一致）を、受付スキーマ(DTO)の分離によって安全に解消。
- **次回への申し送り事項**:
  - 本番環境へのデプロイ実行、および `ANALYTICS_SERVICE_URL` などの環境変数の設定・疎通確認。

### 2026-03-31 21:10 - ダッシュボードの安定化と機能強化、長期記憶スキルの導入

- **通信の安定化**: Hono/Wrangler(Backend) と Python(Analytics) 間の通信で IPv6 の解決に起因するタイムアウトが発生していたため、`localhost` から `127.0.0.1` に明示的に変更。
- **UI/UX の改善**: 
  - Next.js フロントエンドを `Suspense` と `Skeleton` ローダーを使用した非同期レンダリングに刷新。ページ全体のフリーズを解消。
  - `lightweight-charts` v5 の `createSeriesMarkers` API に移行し、チャート上に経済指標の発表時刻をマーカー（青い矢印）で表示する機能を実装。
- **データマッピングの修正**: フロントエンドの選択肢（例: 「雇用統計」）と MT5 の内部データ名（例: 「非農業部門雇用者数」）の不一致による「データなし」エラーを、`IndicatorSelector.tsx` に辞書マッピングを導入することで解決。
- **プロジェクト記憶スキルの導入**: プロジェクトの文脈を持続させるため、`.agents/skills/project_memory` スキルと `.agents/PROJECT_MEMORY.md` を作成。`rules.md` を更新し、全作業終了時の記憶保存を義務化。
- **不要な資産の削除**: プロジェクトで使用しなくなった Go 言語による旧バックエンド実装 (`apps/backend_go/`等) を完全に削除し、リポジトリを軽量化。

**次回への申し送り**:
- チャート表示の ZigZag ロジックが現在は簡易的なプレースホルダーのため、`pandas-ta` 等を用いた本格的なアルゴリズムへの差し替えを検討中。
- 現在はローカル D1 DB を使用しているため、リモート Cloudflare D1 への移行準備が必要。
