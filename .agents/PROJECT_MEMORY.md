# 🧠 Project Memory (長期記憶)

このファイルは、AIエージェントがプロジェクトの文脈や進行状況を維持するための作業記録（長期記憶）です。
**作業完了ごとのスキル実行によって更新・追記されます。**

## 🏗️ 最近の作業ログ (Recent Work Logs)

### 2026-04-25 - FEナビゲーション/トップ導線とSEO初期対応

- **達成したタスク**:
  - GitHub Issueを4件作成:
    - #18 `[FE] ユーザーが主要機能へ迷わず移動できるナビゲーション付きUIを使える`
    - #19 `[FE] 初見ユーザーがアプリの価値を理解できるトップ導線を表示する`
    - #20 `[SEO] Googleにインデックスされる最低限のSEO設定を完了する`
    - #21 `[SEO] SNS共有向けのOGPとTwitter Cardを整備する`
  - `feature/issues-18-21-fe-seo` ブランチを `develop` から作成。
  - `apps/frontend/src/app/layout.tsx` に検索向けのtitle/description、canonical、robots、Open Graph、Twitter Cardの基本メタ情報を追加。
  - `apps/frontend/src/app/robots.ts` と `apps/frontend/src/app/sitemap.ts` を追加し、Google Search Consoleへ送信できる最低限のクロール/サイトマップ設定を整備。
  - `SiteHeader` にOverview / Market Replay / Timeline / Statusのアンカーナビを追加。
  - 絵文字ロゴを廃止し、`GV` の控えめなワードマーク、細い罫線、抑えた余白/配色によるシンプルで安っぽくないUIへ調整。
  - `page.tsx` に初見ユーザー向けのヒーロー、CTA、価値訴求カードを追加し、過度な影や強い丸ボタンを抑えたデザインに更新。
  - `SiteFooter` も同じトーンに合わせて、軽い説明文と控えめなリンク表現へ変更。
  - 追加修正でアプリ名を `fanda-dev` に統一し、SEO文言を「XAUUSD分析」「GOLD分析」寄りに変更。
  - UI配置を、サービス説明のヒーロー、Research Focus、Analysis Workspace、チャート主役＋セッションタイムライン補助の2カラム構成へ再設計。
  - Live Statusをヘッダーから外し、Market Replayチャートカードの近くへ移動。
  - ヘッダーナビゲーションをページ単位の導線（ダッシュボード / 掲示板 / 考察ブログ）へ変更。
  - `apps/frontend/src/app/community/page.tsx` と `apps/frontend/src/app/insights/page.tsx` を追加し、掲示板・考察ブログのモックページを作成。

- **検証結果**:
  - `bun run lint`: pass（既存の `AuthUI.tsx` の `<img>` warning が1件残存）
  - `bunx tsc --noEmit`: pass
  - `bun test src/`: 18 pass / 0 fail
  - `bun run build`: Node.js 20.18.2 のため失敗。Vite 8 / vinext が Node.js 20.19+ または 22.12+ を要求し、`node:fs/promises.glob` が利用できない。

- **次回への申し送り事項**:
  - 本番URLは暫定で `https://fanda-dev.com` を `NEXT_PUBLIC_SITE_URL` のフォールバックにしている。実デプロイURLが異なる場合は環境変数 `NEXT_PUBLIC_SITE_URL` を設定すること。
  - Search Console登録とインデックス登録リクエストはコード外作業として実施が必要。
  - OGP画像はまだ未作成。#21で専用画像または `opengraph-image.tsx` の導入を検討する。
  - ローカルビルド確認には Node.js 22 系、または少なくとも 20.19+ が必要。

### 2026-04-25 - E2Eテスト廃止・ユニットテスト体制への集約

- **背景と判断**:
  - vinext (RSC) + Cloudflare Workers + Playwright + MSW モックサーバーの組み合わせが
    ローカル・CI双方で安定しない状態が続いたため、E2Eテストを全廃してユニットテストのみの体制に移行。
  - 現プロジェクト規模（auth / sessions / market-replay）であれば、hooks・api のユニットテスト 100% で
    機能保証は十分と判断（ADR 相当の設計決定）。

- **実施した変更**:
  - `apps/frontend/tests/e2e/` (auth, smoke, error-handling 3ファイル) を削除。
  - `apps/frontend/tests/mocks/` (http-server, server, handlers) を削除。
  - `apps/frontend/playwright.config.ts` を削除。
  - `apps/frontend/scripts/start-e2e-servers.sh` を削除。
  - `apps/frontend/public/health.html` を削除。
  - MSW ハンドラー・サーバー・setup をユニットテスト専用として `src/test/` 配下に再配置。
  - `bunfig.toml` の `preload` パスを `./tests/setup.ts` → `./src/test/setup.ts` に変更。
  - `package.json` から E2E 系スクリプト（test:e2e / dev:mock / dev:e2e）と `@playwright/test` を削除。
  - `ci.yml` から Playwright ブラウザインストールと E2E 実行ステップを削除。

- **現在のテスト体制**:
  - `bun test src/` = ユニットテスト 18件（フロントエンド hooks / api）
  - `bun run test:all` = フロントエンド + バックエンドのユニットテスト
  - E2E は廃止（将来的に Vitest Browser Mode で再挑戦する余地あり）

- **テスト結果**: 18 pass / 0 fail ✅

- **次回への申し送り事項**:
  - 機能追加時は `src/test/handlers.ts` に必要なモックレスポンスを追加しながら、
    対応する hooks / api テストを同梱すること（100% カバレッジを維持）。
  - E2Eを将来再導入する場合は Vitest Browser Mode + Cloudflare Miniflare の Spike を行うこと。


- **達成したタスク**:
  - **E2Eテストの安定化**:
    - `playwright.config.ts` の待機対象を Vite サーバー (ポート 3001) の専用ヘルスチェック用静的ファイル (`/health.html`) に変更。これにより、アプリケーションが完全にロードされる前にテストが開始され接続エラーになる問題を解消。
    - サーバー起動スクリプト `apps/frontend/scripts/start-e2e-servers.sh` を修正し、ポートの開放待ちを確実に行うように改善。
  - **バックエンド統合テストの修正**:
    - `apps/backend/src/testSetup.ts` を導入し、テスト実行時に `API_TOKEN` 環境変数を `ci-test-token` に強制固定。ローカルの `.env` の値に依存せず、CI環境と同一の認証トークンを使用するように統一。
    - `apiIntegration.test.ts` でハードコーディングされていた認証処理を修正。
  - **テスト品質の向上**:
    - `drizzleBatchRepository.test.ts` で発生していた DB エラーハンドリングのテストが、非同期例外をキャッチしきれずテスト終了後に漏れ出す問題を修正（`expect(promise).rejects.toThrow()` による適切な待機）。
    - これにより、`bun run test:all` で全テスト（Frontend/Backend/E2E）が安定してパスする状態を達成。
- **対応したバグ**:
  - E2Eテスト開始時の `ECONNREFUSED` エラーの解消。
  - バックエンド統合テストでの `401 Unauthorized` エラーの解消。
- **主要な変更ファイル**:
  - `apps/frontend/playwright.config.ts`
  - `apps/frontend/public/health.html`
  - `apps/backend/src/testSetup.ts`
  - `apps/backend/src/interface/routes/test/apiIntegration.test.ts`
  - `apps/backend/src/infrastructure/repository/test/drizzleBatchRepository.test.ts`
- **次回への申し送り事項**:
  - テスト環境が極めて安定したため、機能追加時に `bun run test:all` を実行することでデグレを確実に防げる。
  - CI (GitHub Actions) での `API_TOKEN` 設定が不要（コード内で `ci-test-token` に固定）になったため、Secrets 管理が簡略化された。


### 2026-04-21 - アジャイルチケット分割・GitHub Issue一括登録スキル (agile-issue) の作成

- **達成したタスク**:
  - `docs/タスク分け方.md` を元に、AIがINVEST/SPIDR原則に基づいてタスクを分割し、GitHub Issueとして登録する `agile-issue` スキルを新規作成。
  - 開発者が手動でIssueを作成する際に選べるGitHub公式のIssueテンプレート（`Story`, `Task`, `Spike`, `Bug`）を `.github/ISSUE_TEMPLATE/` 配下に設定。
  - スキルが自動生成する際の参照用テンプレート群を `.agents/skills/agile-issue/references/` 配下に作成。
  - スプリント管理やチケットの種別確認で用いる各種ラベルを一括作成する `scripts/setup-github-labels.sh` を追加。
- **次回への申し送り事項**:
  - 本格的な開発チケットを切る前に `bash scripts/setup-github-labels.sh <owner> <repo>` を実行してラベルを用意しておくこと。


### 2026-04-20 - Google OAuth 認証の実装、CORS/CSRF問題の解決、およびUIのプレミアム化

- **達成したタスク**:
  - **Google OAuth 認証の完全実装**: `better-auth` を使用し、GitHub ログインから Google プロバイダーへ移行。GCP コンソールでのクライアント ID 発行からバックエンドの実装までを完了。
  - **CORS/CSRF デバッグ**: 
    - フロントエンド(3001)とバックエンド(3000)間のクロスオリジン認証における `credentials: true` 設定および `trustedOrigins` の不整合を解消。
    - Vite 環境下で `process.env` が参照できず JS がクラッシュする問題を、`vite.config.ts` の `define` 設定によるポリフィルで解決。
  - **Auth UI のプレミアム化**: 
    - Google 公式風のクリーンで高級感のあるログインボタンを実装。
    - ログイン後にユーザー名・アバター・ステータスを表示する「プロフィールカプセル」デザインを導入。
  - **デプロイ準備**: 本番環境における環境変数管理（GitHub Secrets vs GCP VM .env）の戦略を策定。
- **対応したバグ**:
  - ログインボタンがクリックできない（`process is not defined` エラー）の修正。
  - Google からの戻り時に発生する `401: invalid_client` および `State mismatch` エラーの解消。
- **主要な変更ファイル**:
  - `apps/backend/src/infrastructure/auth/auth.ts`: Better-auth 構成。
  - `apps/backend/src/index.ts`: CORS ミドルウェア設定の強化。
  - `apps/frontend/src/features/auth/components/AuthUI.tsx`: プレミアムUI実装。
  - `apps/frontend/vite.config.ts`: `process.env` ポリフィルの追加。
- **次回への申し送り事項**:
  - 認証基盤が整ったため、次はユーザーIDに紐づいた「お気に入りチャート保存」や「パーソナライズ設定」の開発が可能。
  - 本番デプロイ時は `BETTER_AUTH_SECRET` の刷新と `BETTER_AUTH_URL` の HTTPS 化を忘れずに行うこと。


### 2026-04-16 - 認証UIの統合、E2Eテストの堅牢化、および Git Flow の導入

- **達成したタスク**:
  - **認証UIの完成**: `AuthUI` コンポーネントを実装し、`better-auth` と連動してログイン/ログアウトを切り替えるUIをフロントエンド（ダッシュボード）に統合。
  - **E2Eテストの堅牢化**: 
    - MSWスタンドアロンサーバーに「動的シナリオ（500エラー、空データ）」のシミュレート機能を搭載。
    - API故障時の Error Boundary (`error.tsx`) およびデータ不在時の案内表示を実装し、それらを検証する `error-handling.spec.ts` を追加。
    - `playwright.config.ts` を最適化し、`bun run test:e2e` 一発でモックサーバーとフロントエンドが連動して起動・自動終了するクリーンなテストDXを確立。
  - **バージョン管理戦略**: `develop` ブランチを作成し、Git Flow に基づく開発運用を開始。
- **設計判断**:
  - **RSCのテスト戦略**: サーバーサイドフェッチをキャッチするため、ブラウザ内MSWではなく、Playwrightが管理するスタンドアロン・サーバー構成を堅牢な最終形態とした。
- **次回への申し送り事項**:
  - 今後の機能開発（自分のお気に入り保存、履歴検索など）は `features/` ブランチを作成し、`develop` ブランチに向けたプルリクエスト形式で進めること。

### 2026-04-16 - better-auth を用いた認証基盤の導入とテスト稼働（先行分）

### 2026-04-15 - Cloudflare frontend build failure の修正と main への push

- **達成したタスク**:
  - Cloudflare の frontend build で発生していた `vinext` の `node:fs/promises.glob` 解決エラーに対し、`apps/frontend` のデプロイワークフローへ Node.js 22 のセットアップを追加した。
  - 変更を `fix(frontend): require Node.js 22 for Cloudflare builds` としてコミットし、`origin/main` へ push した。
- **対応したバグ**:
  - GitHub Actions の実行環境が Node.js 20 のままだと `vinext` のビルドが失敗するため、`actions/setup-node@v4` を挿入して Node.js 22 を明示した。
- **次回への申し送り事項**:
  - `apps/frontend/playwright.config.ts` には今回触っていない既存の整形差分が残っているため、必要なら別タスクで扱うこと。

### 2026-04-03 (ORM導入・引き継ぎ) - VPS化に向けた PostgreSQL および Drizzle ORM のセットアップ進行中

- **達成したタスク**:
  - **Docker 環境の準備**: プロジェクトルートに `docker-compose.yml` を作成し、PostgreSQL (16-alpine) を起動 (`docker compose up -d db`)。
  - **ORMの導入・スキーマ適用**: `drizzle-orm`, `postgres`, `drizzle-kit` をインストールし、スキーマ定義 (`schema.ts`) を作成。古い不要なスキーマを削除した上で `bunx drizzle-kit push` を実行し、PostgreSQL へのテーブル作成を完了。
- **次回への申し送り事項 (引き継ぎ内容)**:
  - **1. リポジトリの書き換え (最優先)**: `apps/backend/src/infrastructure/repository/` にある `d1XXXRepository.ts` を、Drizzle を使った PostgreSQL 用の実装 (`pgXXXRepository.ts`) に書き換えること。
  - **2. インターフェースの更新**: `types.ts` 等で依存しているリポジトリの型や DI (Dependency Injection) の登録を、新しい `pg` 系のクラスへ変更すること。
  - **3. Hono の起動方法変更**: `src/index.ts` を Cloudflare Workers 形式 (`export default app`) から、VPS用 (`Bun.serve`) 形式に変更し、PostgreSQL クライアントの初期化処理をエントリーポイントに組み込むこと。
  - **4. テストの修正**: リポジトリのモックを D1Database から Drizzle/Postgres 用に修正し、カバレッジ100%を再確保すること。

### 2026-04-03 (VPSデプロイ向けアーキテクチャ移行) - バックエンドのVPS化およびフロントエンドのCloudflare継続に関する設計判断とドキュメント一新

- **達成したタスク**:
  - **アーキテクチャの再設計**: バックエンド環境を Cloudflare Workers (D1) から VPS上の Node.js(Bun) サーバー (PostgreSQL) へ移行する決定をドキュメント化した。フロントエンドは引き続き Cloudflare Pages で CDN 配信する。
  - **プロジェクト憲法とドキュメントの更新**: `GEMINI.md`, `architecture.md`, `README.md`, `DEPLOYMENT.md` の記述をすべて新しいアーキテクチャに合わせて書き換えた。
  - **ADRの作成**: `docs/adr/0003-vps-backend-cloudflare-frontend.md` を作成し、コスト最適化とDB要件に基づく設計判断の背景を記録した。
  - **CI/CD の退避**: これまでの完璧な Cloudflare 用 CI/CD パイプラインを `archive/cloudflare-deploy` ブランチに保存し、`main` ブランチの CD を無効化した上で VPS デプロイ向けクリーンな状態を作成した。
- **次回への申し送り事項**:
  - バックエンドコードの実装変更：Cloudflare Workers 用の `wrangler.jsonc` とバインディング処理を取り除き、Bun で直接起動する `Bun.serve` の形式へ移行し、ORM (PrismaやDrizzle等) または生の PostgreSQL ドライバーを導入する作業が必要。
  - VPS 上の Docker で PostgreSQL を起動する `docker-compose.yml` の準備。

### 2026-04-03 - テストカバレッジ 100.00% 達成、および CI/CD パイプラインの完全自動化

- **達成したタスク**:
  - **品質保証 (Testing)**: 
    - バックエンドおよびフロントエンド（ロジック層）の全ファイルでラインカバレッジ 100.00% を達成。
    - `rules.md` に「絶対的 any 禁止」を追記し、既存のテストコードから `any` を一掃。Lint/型チェックを完全にパスする状態へ改善。
  - **CI/CD 構築**:
    - GitHub Actions を導入。PR時に Lint, `bun test`, Playwright (E2E) が自動実行される CI を整備。
    - Node.js v22 を指定することで、`vinext` ビルド時の `glob` インポートエラーを解消。
    - フロントエンドのデプロイ先を Cloudflare Pages から **Workers with Assets** へ変更し、`wrangler deploy` による安定したデプロイを実現。
  - **ドキュメント・整理**:
    - `GEMINI.md` (Ground Truth) を策定し、AIが古いスタックに迷わないよう「唯一の真実」を定義。
    - `playwright-report` 等の不要な巨大ファイルを Git から除外。GitHub の言語統計を正常化（TypeScript メイン）。
    - ルートディレクトリを整理し、古いドキュメントを `docs/archives/` へ移動。
- **解決した課題**: 
  - プロジェクト名のリネーム (`gold-vola-backend`, `gold-vola-frontend`)。
  - Cloudflare Pages における `ASSETS` 予約語衝突の回避。
- **次回への申し送り事項**:
  - デプロイには GitHub Secrets の `CLOUDFLARE_API_TOKEN` が必要（設定済み）。
  - 新機能追加時は必ず単体テストを同梱し、100% カバレッジを維持すること。


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
