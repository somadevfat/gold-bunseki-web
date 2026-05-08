# 🧠 Project Memory (長期記憶)

このファイルは、AIエージェントがプロジェクトの文脈や進行状況を維持するための作業記録（長期記憶）です。
**作業完了ごとのスキル実行によって更新・追記されます。**

## 🏗️ 最近の作業ログ (Recent Work Logs)

### 2026-05-08 - Issue #42 Statusページ実装 / PR #97

- **達成したタスク**:
  - GitHub Issue一覧を取得し、ノートPC同期サーバー運用系（#76/#78）を除外して依存関係を確認。
  - 依存なしで進められる #42 `[FE] Statusページを実装する` を選定し、`develop` から `feature/issue-42-status-page` を作成。
  - `/status` ページを追加し、`/api/v1/sync/status` の `syncHealth`, 最終Candle/Session/Event、保存済みCandle件数を表示。
  - 同期ステータス取得用の `getSyncStatus` フロントAPIラッパーと `SyncStatusResponse` 型を追加。
  - API取得失敗時の案内表示、StatusページのSEO metadata、`/status` の sitemap 追加を実装。
  - Statusページ、同期ステータス取得、sitemap のテストを追加。
  - 既存の `getCommunityThreads.test.ts` が `excerpt` を使っていて `CommunityThread.body` 型とずれていたため、型チェック通過のため `body` に修正。
  - PR #97 `https://github.com/somadevfat/gold-bunseki-web/pull/97` を `develop` 向けに作成。

- **検証結果**:
  - `cd apps/frontend && bun test src/app/status/page.test.tsx src/features/sync/api/getSyncStatus.test.ts src/app/sitemap.test.ts`: 7 pass / 0 fail
  - `cd apps/frontend && ./node_modules/.bin/tsc --noEmit`: pass
  - `cd apps/frontend && bun run build`: pass（Wranglerのホーム配下ログ書き込みで `EROFS` warning は出たが終了コード0）
  - `bun run lint:all`: pass
  - `bun run test:all`: frontend 65 pass / backend 100 pass

- **次回への申し送り事項**:
  - PR #97 のCI確認とレビュー対応を行う。
  - ノートPC同期運用そのものは今回スコープ外。同期状態の精度をさらに高める場合は #77 を先に進める。
  - 同期以外の次候補は、依存なしの #37 リサーチメモ保存API、または #33 考察ブログ記事ソース方式のSpike。

### 2026-05-08 - Issue #41/#43 フッター導線ページ追加

- **達成したタスク**:
  - ノートPC同期系以外で依存が軽い Issue #41 `Privacy & Securityページ` と Issue #43 `APIドキュメントページ導線` に対応。
  - `feature/issues-41-43-footer-pages` ブランチを `develop` から作成。
  - `/privacy` ページを追加し、収集情報、利用目的、Cookie/認証、MT5同期データ、セキュリティ、問い合わせ先を説明。
  - `/api-docs` ページを追加し、Swagger UI / OpenAPI JSON へのリンクと Market / Sync / Community API の用途を説明。
  - フッターの `API` リンクを `/api-docs` に修正し、`/privacy` と `/api-docs` を sitemap に追加。
  - ページ表示、SEO metadata、フッターリンクのテストを追加。

- **検証結果**:
  - `cd apps/frontend && bun test src/app/privacy/page.test.tsx src/app/api-docs/page.test.tsx src/features/common/components/SiteFooter.test.tsx`: 5 pass / 0 fail
  - `bun run lint:all`: pass
  - `bun run test:all`: frontend 58 pass / backend 100 pass

- **次回への申し送り事項**:
  - #41/#43 はPRマージ後に完了コメント付きでクローズする。
  - 次に同期以外で進めるなら、依存が満たされた #32 掲示板スレッド詳細/返信UI、または #37 リサーチメモ保存API が進めやすい。

### 2026-05-06 - Issue #75 MT5定時POSTスケジューラ実装

- **達成したタスク**:
  - Issue #75 `[Analytics] MT5から定時POSTするノートPC同期スクリプトを実装する` に対応。
  - `feature/issue-75-scheduled-sync` ブランチを `develop` から作成。
  - `apps/analytics/api/scheduled_sync.py` を追加し、`SCHEDULED_SYNC_TIMES` で指定した時刻に `gold_calendar_cache.json` のSHA-256ハッシュを確認する常駐スケジューラを実装。
  - 前回POST済みハッシュと同一の場合はスキップし、差分がある場合のみ既存 `run_analysis_and_push()` を呼び出して Hono の `/api/v1/sync/data` へPOSTする構成にした。
  - `HONO_SYNC_URL`, `API_TOKEN`, `SCHEDULED_SYNC_*`, `CALENDAR_CACHE_PATH` の設定を `.env.example`, `apps/analytics/README.md`, `docs/SYNC_AND_SEED.md` に追記。
  - `apps/analytics/api/test_scheduled_sync.py` を追加し、時刻パース、指定時刻判定、差分ありPOST、差分なしスキップ、同一スロット二重実行防止を検証。

- **検証結果**:
  - `python3 -m unittest test_scheduled_sync`: 5 pass / 0 fail
  - `python3 -m py_compile apps/analytics/api/scheduled_sync.py apps/analytics/api/server.py apps/analytics/api/test_scheduled_sync.py`: pass
  - `.venv/bin/ruff check apps/analytics/api/server.py apps/analytics/api/scheduled_sync.py apps/analytics/api/test_scheduled_sync.py`: pass
  - `bun run lint:all`: pass
  - `bun run test:all`: frontend 53 pass / backend 100 pass

- **次回への申し送り事項**:
  - #76 で Windows タスクスケジューラ/自動起動/ログ保存/スリープ抑止の運用設定を詰める。
  - #77 で Backend 側の同期状態更新・確認手順を強化する。
  - 実機ノートPCでは MT5 と `GoldCalendarPush.mq5` を常時起動し、`SCHEDULED_SYNC_TIMES` と本番 `HONO_SYNC_URL` / `API_TOKEN` を設定して疎通確認する。

### 2026-05-06 - PR #92 掲示板投稿作成APIテストのCI失敗修正確認

- **達成したタスク**:
  - PR #92 `[CI] developの掲示板投稿作成APIテスト失敗を修正する` のCIログを確認。
  - 失敗していたRunは `pull/90/merge` の修正前CIで、Bun 1.3.13上のテスト順序により `mock.module("@/lib/api/client")` が期待通り効かず、`postMock` が呼ばれないことが根本原因と確認。
  - PR #92 の既存修正で `createCommunityThread` に任意 `AppClient` 注入を追加し、テストをmodule mock依存から明示的なmock client注入へ変更済みであることを確認。
  - Gemini Code Assistのレビューに対応し、`createMockClient` からテスト対象外の `market` API mockを削除し、community APIのみを持つ最小mockへ整理。

- **変更ファイル**:
  - `apps/frontend/src/features/community/api/createCommunityThread.test.ts`

- **検証結果**:
  - `/tmp/bun-1.3.13/bun-linux-x64/bun test apps/frontend/src/features/community/api/createCommunityThread.test.ts`: 2 pass / 0 fail
  - `bun run test:all`: frontend 53 pass / backend 92 pass
  - `bun run lint:all`: pass

- **次回への申し送り事項**:
  - ローカルの `gh auth status` はトークン無効のため、Actionsの再実行やPRチェック確認をCLIで行うには `gh auth login -h github.com` が必要。
  - 作業ツリーには今回のAPIテスト修正以外に、CommunityBoard / CommunityPostForm 周辺の未コミット差分が残っている。

### 2026-05-04 - Issue #83 Sync APIのAppContainer/routes移行PR

- **達成したタスク**:
  - Issue #83 `[BE] Sync APIをAppContainer注入と専用routesへ移行する` を作成。
  - `refactor/issue-83-sync-container-routes` ブランチを `develop` から作成。
  - AppContainer に Sync 用 `GetSyncStatusUseCase` の配線を追加。
  - `SyncController` を static class から `createSyncController(container)` の handler factory に変更。
  - `apps/backend/src/interface/routes/syncRoutes.ts` を追加し、Sync API の route 登録を `createApp.ts` から分離。
  - `syncRepo` の Hono Context 注入と `AppVariables` 型定義を削除。
  - セルフレビューで、Sync POST 異常系の既存API契約 `{ success: false, message }` を維持するよう調整。
  - PR #84 `https://github.com/somadevfat/gold-bunseki-web/pull/84` を `develop` 向けに作成。

- **検証結果**:
  - targeted backend tests: 18 pass / 0 fail
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `bun run test:all`: frontend 45 pass / backend 90 pass
  - `bun run lint:all`: pass

- **次回への申し送り事項**:
  - PR #84 マージ後、MarketController / marketRoutes を同じパターンで移行すると、`diMiddleware` から `priceRepo`, `zigzagRepo`, `sessionRepo`, `batchRepo` の Context 注入も段階的に削除できる。
  - 未追跡の `.agents/skills/self-implement/` と `docs/archives/auth_strategy_zenn.md` は今回PRに含めていない。

### 2026-05-04 - PR #82 Geminiレビュー対応

- **達成したタスク**:
  - PR #82 の Gemini Code Assist コメント3件を確認し、全て対応。
  - `freezeAppContainer` を追加し、グローバル `appContainer` の top-level / repositories / useCases / useCases.community を `Object.freeze` で保護。
  - CommunityController の独自 `console.error` / catch を削除し、例外を `handleAppError` に委譲する設計へ変更。
  - `diMiddleware` から不要になった `communityThreadRepo` の Context 注入を削除し、`AppVariables` 型定義からも削除。
  - PR本文のエビデンスを最新結果（2026-05-04 10:15 JST）へ更新し、各レビューコメントへ対応済み返信を追加。

- **検証結果**:
  - targeted backend tests: 18 pass / 0 fail
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `bun run test:all`: frontend 45 pass / backend 91 pass
  - `bun run lint:all`: pass

- **次回への申し送り事項**:
  - PR #82 はレビュー対応済み。追加コメントがなければマージ可能。

### 2026-05-03 - Issue #81 AppContainer導入と掲示板ルート分離PR

- **達成したタスク**:
  - Issue #81 `[BE] AppContainerで掲示板APIの依存生成とルート登録を整理する` を作成。
  - `refactor/issue-81-app-container-community` ブランチを `develop` から作成。
  - `apps/backend/src/app/container.ts` を追加し、Repository / 掲示板 UseCase の生成を AppContainer に集約。
  - `apps/backend/src/app/createApp.ts` を追加し、Hono アプリの組み立てを `createApp(container, options)` として切り出し、テストで mock container を注入可能にした。
  - `CommunityController` を static class から `createCommunityController(container)` の handler factory へ変更。
  - 掲示板ルート登録を `apps/backend/src/interface/routes/communityRoutes.ts` に分離。
  - `index.ts` を startup env validation / app生成 / Bun.serve export の起動責務へ縮小。
  - PR #82 `https://github.com/somadevfat/gold-bunseki-web/pull/82` を `develop` 向けに作成。

- **検証結果**:
  - `bun test src/app/container.test.ts src/interface/routes/test/apiIntegration.test.ts src/interface/controller/test/communityController.test.ts src/securityMiddleware.test.ts`: 16 pass / 0 fail
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `bun run test:all`: frontend 45 pass / backend 90 pass
  - `bun run lint:all`: pass

- **次回への申し送り事項**:
  - PR #82 マージ後、同じパターンで Market / Sync routes/controller の依存生成と route 登録を段階的に移行できる。
  - 未追跡の `.agents/skills/self-implement/` と `docs/archives/auth_strategy_zenn.md` は今回PRに含めていない。

### 2026-05-02 - CORS Origin マージ修正 Issue #79 / PR #80

- **達成したタスク**:
  - Issue #79 `[BE] fix: CORS許可Origin設定をenv上書きに依存しない実装に修正する` を作成。
  - `fix/issue-79-cors-origin-merge` ブランチを `develop` から作成し、PR #80 を `develop` 向けに作成。
  - `getAllowedOrigins` をデフォルト + env 追加のマージ方式へ変更。
  - テストコードからドメインのハードコードを除去し、`defaultAllowedOrigins` を参照する形に変更（どの環境でも通るテストへ）。
  - `OPTIONS /api/auth/sign-in/social` の preflight テストを追加。
  - `.env.example` に `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` を追加。

- **検証結果**:
  - `bun test src/infrastructure/security/origins.test.ts src/securityMiddleware.test.ts`: 9 pass / 0 fail
  - `bun run test:all`: 89 pass / 0 fail

- **次回への申し送り事項**:
  - PR #80 マージ後、Backend CD を再実行し、本番で CORS 再発しないことを確認する。

### 2026-05-02 - Issueクローズ時の記録ルールをスキルへ追加

- **達成したタスク**:
  - `.agents/skills/agile-issue/SKILL.md` を更新。
  - Issue を閉じるときは無言で close せず、対応内容・検証・残課題をコメントに残すルールを追加。
  - 複数Issueをまとめて閉じる場合も、各Issueに固有の対応内容を書くルールを明記。
  - `gh issue close --comment` のHEREDOC例を追加。

- **検証結果**:
  - `ReadLints` で `.agents/skills/agile-issue/SKILL.md` に診断エラーなし。

- **次回への申し送り事項**:
  - 今後Issueを閉じる際は、必ず対応内容・検証・残課題をGitHubコメントとして残す。

### 2026-05-02 - 本番ログイン完了とCD関連Issueクローズ

- **達成したタスク**:
  - ユーザー側で Google OAuth の Web クライアント設定、本番 `.env` の認証/CORS設定を反映し、本番フロントからGoogleログインできることを確認。
  - Cloudflare Web Analytics の `ERR_BLOCKED_BY_CLIENT` は広告ブロッカー由来でアプリ/認証とは無関係と確認。
  - Googleログイン専用の既存Issueは存在しないことを確認。
  - CDが無事に動いたことを受け、完了済みのCD修正Issue #60, #63, #66, #69, #72 を completed としてクローズ。

- **次回への申し送り事項**:
  - 認証CORS再発防止のローカル差分（`getAllowedOrigins` のデフォルト+追加Origin化、preflightテスト追加、`.env.example` 更新）は未PR。必要なら次にPR化する。
  - OAuth client secret はチャットに貼られたため、ポートフォリオ公開前にGoogle Cloud Consoleで再生成し、本番 `.env` を更新すること。

### 2026-05-02 - 本番GoogleログインCORS原因調査と修正

- **達成したタスク**:
  - 本番フロント `https://fanda-dev.com` から `https://api.fanda-dev.com/api/auth/get-session` / `sign-in/social` へのリクエストが CORS で失敗しているログを確認。
  - 本番APIへ preflight / get-session を `curl` で確認し、`Access-Control-Allow-Credentials` は返るが `Access-Control-Allow-Origin` が返らないことを確認。
  - 原因は `ALLOWED_ORIGINS` が設定されている場合、コード側の本番デフォルト Origin (`https://fanda-dev.com`, `https://www.fanda-dev.com`) を上書きして消してしまう実装。
  - `getAllowedOrigins` を「デフォルト Origin + env 追加 Origin」のマージ方式へ変更し、env の古い/不足設定で本番Originが消えないように修正。
  - `OPTIONS /api/auth/sign-in/social` の preflight が `https://fanda-dev.com` から許可されるテストを追加。
  - `.env.example` に `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` を追加。

- **検証結果**:
  - `cd apps/backend && bun test src/infrastructure/security/origins.test.ts src/securityMiddleware.test.ts`: pass
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `cd apps/backend && bun run lint`: pass
  - `ReadLints`: 関連ファイルに診断エラーなし。

- **次回への申し送り事項**:
  - 即時復旧する場合は本番GCEの `.env` の `ALLOWED_ORIGINS` に `https://fanda-dev.com,https://www.fanda-dev.com` が含まれるよう更新し、backend を再起動する。
  - コード修正を反映する場合はPR/マージ後に Backend CD を再実行し、preflightで `Access-Control-Allow-Origin: https://fanda-dev.com` が返ることを確認する。
  - CORS解消後にGoogle OAuth側で失敗する場合は、Google Cloud Console の Authorized redirect URI に `https://api.fanda-dev.com/api/auth/callback/google` が登録されているか確認する。

### 2026-05-02 - ノートPC MT5定時同期運用のIssue追加

- **達成したタスク**:
  - MT5同期はノートPCを同期サーバーとして使い、決まった時刻に本番BackendへPOSTする方針に決定。
  - GitHub Issue を確認し、MT5/同期/ノートPC/ポートフォリオ系の重複Issueがないことを確認。
  - フロントのStatusページは既存Issue #42 があるため新規作成せず、同期運用に直接必要な4件のみ追加。
  - 追加Issue:
    - #75 `[Analytics] MT5から定時POSTするノートPC同期スクリプトを実装する`
    - #76 `[Ops] ノートPC同期サーバーの自動起動と復旧を設定する`
    - #77 `[BE] 定時同期POSTの受信結果と最終同期状態を確認できるようにする`
    - #78 `[Docs] ノートPCからのMT5定時同期運用手順を整備する`

- **次回への申し送り事項**:
  - まず #75 で定時POSTの正常系を通し、次に #76 でノートPC再起動後の復旧、#77 で同期状態確認、#78 で運用手順化を進める。
  - #42 のStatusページ実装時には #77 の同期ステータス取得結果を表示対象にするとよい。

### 2026-05-02 - 転職用ポートフォリオ完成ロードマップ作成

- **達成したタスク**:
  - 自社開発転職用ポートフォリオとして Gold Volatility Analyzer を仕上げるための作業一覧を整理。
  - `docs/portfolio-roadmap.md` を追加し、機能完成、データ同期、本番運用、セキュリティ、テスト、UI/UX、ドキュメント、面接対策、アプリ理解チェックリストをMarkdownで作成。
  - AI主導で実装された箇所を自分の言葉で説明できるようにするため、Backend / Frontend / Auth / Analytics / CI/CD の理解項目をチェックリスト化。

- **検証結果**:
  - `ReadLints` で `docs/portfolio-roadmap.md` に診断エラーなし。

- **次回への申し送り事項**:
  - 次は `docs/portfolio-roadmap.md` の優先順位に沿って、本番安定化、データ同期環境の決定、README整備、面接回答作成を進める。
  - 特に「Googleログイン本番動作」「掲示板API本番表示」「MT5同期環境」はポートフォリオ完成の最優先項目。

### 2026-05-01 - Backend deploy後の一時的502対策

- **達成したタスク**:
  - Backend CD が GCR pull と migration 成功後、`docker-compose up -d --force-recreate backend` で `db` まで再作成し、その直後の nginx 経由 health check が 502 で失敗していることを確認。
  - Issue #72 `[CI/CD] fix: avoid DB recreate and wait for backend health` を作成。
  - `.github/workflows/cd-backend.yml` の backend 再作成に `--no-deps` を追加し、PostgreSQL コンテナを再作成しないように修正。
  - post-deploy health check のリトライを 5回/10秒から 30回/60秒へ延長。
  - health check 失敗時に `docker-compose ps` と `docker-compose logs --tail=80 backend` を出力するようにし、次回障害時の診断情報を増やした。
  - PR #73 `https://github.com/somadevfat/gold-bunseki-web/pull/73` を `develop` 向けに作成。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass

- **次回への申し送り事項**:
  - PR #73 マージ後、Backend CD ログで `Recreating ...-db` が出ないことを確認する。
  - もしまだ 502 が出る場合は、追加出力される backend logs と compose ps を確認してアプリ起動失敗かnginx upstream問題か切り分ける。

### 2026-05-01 - sudo docker のGCR認証不足修正

- **達成したタスク**:
  - Backend CD が `artifactregistry.repositories.downloadArtifacts` の unauthenticated error で `docker-compose pull backend` に失敗していることを確認。
  - 原因は `gcloud auth configure-docker` がSSHユーザー側のDocker configだけを更新し、実際の `docker-compose` は `sudo` 経由でroot Dockerとして動いていたため、root側にGCR認証が無いこと。
  - Issue #69 `[CI/CD] fix: authenticate sudo docker to GCR before backend pull` を作成。
  - `.github/workflows/cd-backend.yml` で `gcloud auth configure-docker gcr.io --quiet` に絞り、`gcloud auth print-access-token | sudo docker login -u oauth2accesstoken --password-stdin https://gcr.io` を追加。
  - PR #70 `https://github.com/somadevfat/gold-bunseki-web/pull/70` を `develop` 向けに作成。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass

- **次回への申し送り事項**:
  - PR #70 マージ後、Backend CD ログで `Login Succeeded` 相当の docker login 成功と `docker-compose pull backend` 成功を確認する。

### 2026-05-01 - GCE deploy directory 同期漏れの修正PR

- **達成したタスク**:
  - Backend CD ログの `docker-compose config` に `backend.build.context` が出ていることから、GCE上の `~/gold-bunseki-web` が古い `docker-compose.yml` / 古いコードのまま使われていることを根本原因として特定。
  - Issue #66 `[CI/CD] fix: sync GCE deploy repo before docker-compose` を作成。
  - `.github/workflows/cd-backend.yml` のSSH内で `git fetch origin main` → `git reset --hard ${{ github.sha }}` → `git rev-parse HEAD` の一致確認を追加し、デプロイ対象SHAへGCE作業ディレクトリを同期するよう修正。
  - PR #67 `https://github.com/somadevfat/gold-bunseki-web/pull/67` を `develop` 向けに作成。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass

- **次回への申し送り事項**:
  - PR #67 マージ後、Backend CDログで `git rev-parse HEAD` が workflow の `github.sha` と一致することを確認する。
  - その後 `docker-compose config` の backend が `build.context` ではなく `image: gcr.io/...:<sha>` を使うことを確認する。

### 2026-05-01 - Backend CD が古い image を掴む問題の追加修正

- **達成したタスク**:
  - PR #61 マージ後の CD でも `$ drizzle-kit migrate` が実行されていることを確認。`origin/main` の `db:migrate` は runtime migrator に更新済みだったため、GCE 側の `sudo docker-compose` が期待した `BACKEND_IMAGE` を使っていない疑いを特定。
  - Issue #63 `[CI/CD] fix: pass backend image explicitly to docker-compose` を作成。
  - `.github/workflows/cd-backend.yml` の全 `docker-compose` 呼び出しを `sudo env BACKEND_IMAGE="$BACKEND_IMAGE" docker-compose ...` に変更し、sudo 経由でも SHA タグ付き image を確実に compose に渡すよう修正。
  - `docker-compose config` の backend セクションをデプロイログへ出力し、実際に使われる image を確認できるようにした。
  - migration 実行を `bun run db:migrate` ではなく `bun run src/infrastructure/database/migrate.ts` へ変更し、古い package script を掴んだ場合でも検出しやすくした。
  - PR #64 `https://github.com/somadevfat/gold-bunseki-web/pull/64` を `develop` 向けに作成。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass

- **次回への申し送り事項**:
  - PR #64 マージ後の Backend CD ログで `docker-compose config` に `gcr.io/.../gold-vola-backend:<main SHA>` が表示されることを確認する。
  - migration ログが `$ drizzle-kit migrate` ではなく `bun run src/infrastructure/database/migrate.ts` になっていることを確認する。

### 2026-05-01 - Backend CD migration 失敗の追加修正

- **達成したタスク**:
  - PR #58 マージ後の Backend CD で `drizzle-kit migrate` が `/bin/sh: drizzle-kit: not found` により失敗したことを受け、追加 Issue #60 を作成。
  - `drizzle-kit` CLI に依存せず本番コンテナ内で migration を実行できるよう、`apps/backend/src/infrastructure/database/migrate.ts` を追加。
  - `drizzle-orm/postgres-js/migrator` を使って `./migrations` の SQL migration を適用し、完了後に postgres client を close する runtime migration script にした。
  - `apps/backend/package.json` の `db:migrate` を `bun run src/infrastructure/database/migrate.ts` に差し替え、`drizzle-kit` は devDependencies に戻した。
  - PR #61 `https://github.com/somadevfat/gold-bunseki-web/pull/61` を `develop` 向けに作成。

- **検証結果**:
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `bun run lint:all`: pass
  - `bun run test:all`: pass
  - ローカル Docker build は `bun install --production` の dependency resolution で数分停止したため中断。CI/CD上の再実行で最終確認する。

- **次回への申し送り事項**:
  - PR #61 マージ後、Backend CD が `bun run db:migrate` を runtime script として実行し、`drizzle-kit` not found が解消することを確認する。
  - その後 `/health` と `/api/auth/get-session` の post-deploy check、さらに `/doc` に community/auth 追加後の内容が反映されることを確認する。

### 2026-05-01 - Backend CD migration 実行対応とPR作成

- **達成したタスク**:
  - GitHub Issue #57 `[CI/CD] fix: run backend migrations during deployment` を作成。
  - `fix/backend-cd-migrations` ブランチで、掲示板 `community_threads` と Better Auth の `user/session/account/verification` テーブルを作成する Drizzle migration を追加。
  - 本番 backend イメージ内で `bun run db:migrate` が実行できるよう、`drizzle-kit` を backend の production dependency へ移動。
  - `.github/workflows/cd-backend.yml` で、GCE デプロイ時に `docker-compose run --rm backend bun run db:migrate` を実行し、その後 `docker-compose up -d --force-recreate backend` で最新コンテナを確実に再作成するよう修正。
  - デプロイ後に `/health` と `/api/auth/get-session` をリトライ付きで確認する疎通チェックを追加。
  - PR #58 `https://github.com/somadevfat/gold-bunseki-web/pull/58` を `develop` 向けに作成。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass

- **次回への申し送り事項**:
  - PR #58 マージ後、Backend CD が実際に migration → force recreate → health/auth checks を通過することを Actions ログで確認する。
  - 本番 `/doc` に `/api/v1/community/threads` が表示され、`/api/auth/get-session` が 404 ではなくなることを確認する。

### 2026-05-01 - 本番ログイン不可・掲示板APIエラー調査

- **達成したタスク**:
  - 本番 `https://api.fanda-dev.com` の `/api/v1/community/threads`、`/api/auth/get-session`、`/api/auth/sign-in/social` を確認し、いずれも 404 を返すことを確認。
  - 本番 `/doc` の OpenAPI に `/api/v1/community/threads` が含まれていない一方、最新 `origin/main` には `CommunityController` と Better Auth の `/api/auth/**` マウントが含まれることを確認。
  - GitHub Actions の CD Backend は成功しているが、ログ上 `docker-compose up -d backend` が `backend is up-to-date` と表示され、稼働コンテナが最新イメージへ再作成されていない疑いを記録。
  - `apps/backend/migrations/` に `community_threads` および Better Auth の `user/session/account/verification` テーブルを作成する migration が存在しないことを確認。

- **根本原因候補**:
  - 本番バックエンドが最新コード（community/auth 追加後）で稼働していない。
  - 最新コードへ切り替わっても、DB migration が不足しているため掲示板/ログインが DB テーブル不足で 500 になる可能性が高い。
  - 本番 API は `Origin: https://fanda-dev.com` に `Access-Control-Allow-Origin` を返しておらず、ログインのブラウザ通信では CORS 設定/デプロイ反映も要確認。

- **次回への申し送り事項**:
  - CD Backend の `docker-compose up` に `--force-recreate` などを追加し、デプロイ後に `/doc` や `/api/auth/get-session` の疎通確認を入れる。
  - Drizzle migration を生成し、`community_threads` と Better Auth テーブルを本番DBへ適用する手順を追加する。

### 2026-04-29 - 本番フロントのAPI URL誤設定修正

- **達成したタスク**:
  - 本番ログの `localhost:3000/api/auth/get-session` への接続失敗を調査し、`NEXT_PUBLIC_API_URL` 未設定時の `http://localhost:3000` フォールバックが本番ビルドに焼き込まれていることを特定。
  - GitHub Repository Variable `NEXT_PUBLIC_API_URL=https://api.fanda-dev.com` を追加。
  - `.github/workflows/cd-frontend.yml` の Build step に `NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}` を渡す修正を追加。
  - `fix/develop-frontend-api-url-variable` ブランチから `develop` 向け PR #55 を作成。
  - 誤って作成した `main` 向け PR #54 は close 済み。

- **検証結果**:
  - commit hook 経由で `bun run lint:frontend && bun run lint:backend`: pass

- **次回への申し送り事項**:
  - PR #55 マージ後、Cloudflare frontend deploy を再実行し、本番 JS から `localhost:3000` 参照が消えていることをブラウザ Network で確認する。
  - `/status`, `/privacy`, `/api` は現在ページ未作成のため、リンクを残す場合は各ページを追加する。

### 2026-04-28 - Issue #29 掲示板一覧のAPI接続

- **達成したタスク**:
  - `feature/issue-29-community-api-list` ブランチを `develop` から作成。
  - `/community` の固定モック配列を削除し、`getCommunityThreads()` 経由で掲示板投稿一覧APIを取得する構成へ変更。
  - `CommunityThreadList` コンポーネントを追加し、投稿一覧表示と空状態を分離。
  - `apps/frontend/src/app/community/loading.tsx` を追加し、掲示板ページの読み込み状態を表示。
  - MSWハンドラーに `/api/v1/community/threads` の正常・空・500応答を追加。
  - API取得・表示コンポーネント・MSWハンドラーのテストを追加。

- **検証結果**:
  - `cd apps/frontend && bun run lint`: pass
  - `cd apps/frontend && bunx tsc --noEmit`: pass
  - `cd apps/frontend && bun test src/`: 45 pass / 0 fail
  - `cd apps/frontend && bun run build`: Node.js 20.18.2 のため失敗。Vite 8 / vinext が Node.js 20.19+ または 22.12+ を要求し、`node:fs/promises.glob` が利用できない。

- **次回への申し送り事項**:
  - Issue #29 はフロントエンド側のAPI接続実装。実運用で一覧表示するには依存Issue #28 のバックエンドAPI実装が必要。
  - 期待エンドポイントは `/api/v1/community/threads`、レスポンスは `{ threads: CommunityThread[] }`。

### 2026-04-26 - PR #27 セルフレビュー追加修正

- **達成したタスク**:
  - `feature/remaining-open-issues` の PR #27 をセルフレビューし、CI通過済みの差分を再確認。
  - `apps/frontend/src/test/setup.ts` のテスト後処理を `document.body.replaceChildren()` から Testing Library `cleanup()` に変更。
  - `@testing-library/react` は happy-dom の global document 初期化後に動的 import し、React effect の unmount cleanup が各テスト後に実行されるようにした。
  - 修正コミット `729fd39 fix: run React cleanup after frontend tests` を push 済み。

- **検証結果**:
  - `bun test src/features/common/components/ToastProvider.test.tsx src/features/forms/components/ResearchNoteForm.test.tsx`: pass
  - `cd apps/frontend && bunx tsc --noEmit`: pass
  - `bun run lint:all`: pass
  - `bun run test:all`: pass
  - `cd apps/frontend && bun run test --coverage`: All files 100.00 / 100.00
  - `cd apps/backend && bun run test --coverage`: All files 100.00 / 100.00
  - PR #27 GitHub Actions `lint-and-test`: pass

- **次回への申し送り事項**:
  - フロントエンド test setup で Testing Library を使う場合は、DOM global 初期化前の静的 import を避けること。

### 2026-04-26 - 残Issueの基盤実装とdevelop向けPR作成

- **達成したタスク**:
  - `develop` を `origin/develop` から最新化し、`feature/remaining-open-issues` ブランチを作成。
  - Issue #24 は PR #25 が `develop` にマージ済みだったため completed としてクローズ。
  - Issue #7/#8/#9/#11/#13/#14/#15 をまとめて解消する PR #27 を `develop` 向けに作成。
  - バックエンドに RFC 7807 風の標準化エラーレスポンス、`requestId`、JSON構造化アクセスログ、同期API用 Bearer 認証ミドルウェアを追加。
  - フロントエンドの root layout に `SiteHeader` / `SiteFooter` / `ToastProvider` を集約し、ページごとの重複レイアウトを削除。
  - Toast 通知基盤、`useToast`、React Hook Form + zod の `ResearchNoteForm` サンプル基盤を追加。
  - Playwright/E2E 廃止後の方針に合わせ、MSW の `x-test-scenario` 異常系をユニットテストで検証する形へ整理。
  - `react-hook-form`, `@hookform/resolvers`, `zod` をフロントエンド依存に追加。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass（frontend 23件、backend 73件）
  - `cd apps/backend && bunx tsc --noEmit`: pass
  - `cd apps/frontend && bunx tsc --noEmit`: pass

- **次回への申し送り事項**:
  - バックエンドの構造化ログはテスト実行時にもJSONログを出力する。必要ならテスト環境だけ logger を差し替え可能にする。
  - #15 は E2E 復活ではなく、現行方針の MSW ユニットテストとしてクローズする設計判断。

### 2026-04-25 - 認証・Honoセキュリティ強化PR

- **達成したタスク**:
  - GitHub Issue #24 `[BE/FE] [Task] 認証とHono周辺のセキュリティ設定を強化する` を作成。
  - `feature/issue-24-security-hardening` ブランチを `develop` から作成し、PR #25 を `develop` 向けに作成。
  - Better Auth の `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` / Google OAuth env を `readRequiredEnv` で起動時必須に変更し、ハードコードされたシークレットフォールバックを削除。
  - Hono CORS と Better Auth `trustedOrigins` の許可 Origin を `getAllowedOrigins` に共通化し、未使用の `http://localhost:5173` をデフォルト許可から除外。
  - CORS は未知 Origin に許可済み Origin を返さない fail-closed 挙動へ変更し、`secureHeaders` による基本セキュリティヘッダーを追加。
  - Playwright 廃止後に残っていた `apps/frontend/playwright-local.config.ts` を削除し、`.agents/skills/execute-task/SKILL.md` の E2E 参照をユニットテスト方針に更新。
  - OAuth プロフィール画像に `referrerPolicy="no-referrer"` を追加し、SEO関連ページ/関数へ `@responsibility` JSDoc を追加。

- **検証結果**:
  - `bun run lint:all`: pass
  - `bun run test:all`: pass（frontend 18件、backend 68件）

- **次回への申し送り事項**:
  - デプロイ環境では `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `API_TOKEN` の設定が必須。
  - 追加の許可 Origin が必要な場合は `ALLOWED_ORIGINS` にカンマ区切りで明示する。

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
