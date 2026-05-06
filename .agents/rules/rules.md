---
trigger: always_on
---

# Codex 共通ルール

このファイルは、このリポジトリにおける AI 作業の一次ルールです。Cursor / Copilot 由来の古い運用よりも、ここに書かれた Codex 用ルールを優先してください。

## 1. 基本姿勢

- 回答・説明・レビューコメント・PRコメントは、ユーザーから別指定がない限り日本語で行う。
- コード内コメント、テスト名、ユーザー向けエラーメッセージは原則日本語でよい。
- コミットメッセージだけは Conventional Commits に従い、件名・本文・フッタを英語のみ、ASCII のみで書く。
- ユーザーが「実装」「修正」「PR作成」などを依頼した場合は、提案だけで止めず、実装・検証・PR準備まで進める。
- ただし、Issue 実装フローや PR フローで明示的な合意が必要な場面では、該当スキルの手順を優先する。

## 2. Codex で必ず守ること

- 作業開始時に `git status --short --branch` を確認し、既存の未コミット差分を把握する。
- 既存の未コミット差分はユーザーまたは他エージェントの作業とみなし、勝手に revert / reset / checkout しない。
- 変更を stage / commit するときは、今回の依頼に含まれるファイルだけを明示的に指定する。
- ファイル編集は原則 `apply_patch` を使う。生成物やフォーマッタ実行を除き、シェルのリダイレクトで雑に上書きしない。
- 検索は可能な限り `rg` / `rg --files` を使う。使えない環境では PowerShell / `find` / `grep` へ切り替え、理由を簡潔に記録する。
- `bun`, `gh`, `rg` などが環境にない場合は、代替コマンドや GitHub HTTPS / MCP を検討する。代替した事実は最終報告や PR Evidence に必ず書く。
- Codex から見える GitHub MCP は read 権限だけの場合がある。write 操作が 403 の場合は、`gh`、HTTPS push、Git Credential Manager、またはユーザー確認へ切り替える。

## 3. スキルの使用ルール

- ユーザーが Issue 実装を依頼したら、`.agents/skills/execute-task/SKILL.md` を読む。
- ユーザーが PR 作成を依頼したら、`.agents/skills/create-pr/SKILL.md` を読む。
- テストを追加・修正する場合は、`.agents/skills/test_coding/SKILL.md` を読む。
- Hono のルート、middleware、controller、OpenAPI を触る場合は、`.agents/skills/hono/SKILL.md` を読む。
- ADR が必要な設計判断、技術選定、アーキテクチャ変更では、`.agents/skills/adr-manager/SKILL.md` を読む。
- 作業終了時には、`.agents/skills/project_memory/SKILL.md` に従い `.agents/PROJECT_MEMORY.md` の最近の作業ログへ追記する。
- スキルに書かれた手順とユーザーの最新指示が衝突する場合は、ユーザーの最新指示を優先し、何を変更したかを報告する。

## 4. アーキテクチャ

### Backend

- Hono / Clean Architecture を前提にする。
- `domain/`: エンティティ、ドメイン型、ドメインルール。
- `application/`: use case、port。
- `interface/`: routes、controller、middleware、HTTP 表現。
- `infrastructure/`: DB、外部サービス、設定、認証。
- controller は use case へ処理を委譲し、ビジネスロジックを抱え込まない。
- route 登録や OpenAPI 定義を変更する場合は、関連 controller / use case / test を合わせて確認する。

### Frontend

- Next.js / vinext / Feature-Sliced Design を前提にする。
- `src/features/<feature>/api`: API 呼び出し。
- `src/features/<feature>/components`: その機能専用 UI。
- `src/features/<feature>/hooks`: 状態・副作用・ロジック。
- データ取得はできる限り Server Component 側に寄せ、操作やフォームなどクライアント状態が必要な箇所だけ Client Component にする。
- API 型は `src/lib/api/client.ts` の既存方針を尊重し、重複型を増やしすぎない。

## 5. TypeScript / 実装品質

- `any` は禁止。テストやモックでも `unknown`、型ガード、明示的な型定義を使う。
- 既存の設計・命名・ディレクトリ構造を優先し、不要な抽象化や大きなリファクタを混ぜない。
- ログ、内部エラー、技術的な識別子は英語でよい。ただし UI とユーザー向け文言は日本語を優先する。
- 文字化けしている既存ファイルを触る場合は、該当箇所を読める UTF-8 の日本語へ直してよい。ただし unrelated な大規模修正は避ける。

## 6. テスト / 検証

- 変更後は、影響範囲に応じて lint、type check、unit test、build を実行する。
- 標準の優先順は次の通り。
  - `bun run lint:all`
  - `bun run test:all`
  - frontend: `cd apps/frontend && bun run lint && bun run test`
  - backend: `cd apps/backend && bun run lint && bun run test`
  - TypeScript: `tsc --noEmit` または対象 package の `node_modules/.bin/tsc`
- `bun` が使えない環境では、実行可能な `tsc` / `eslint` / targeted test で代替し、未実行コマンドと理由を必ず記録する。
- ロジック層、API wrapper、hooks はユニットテストを追加・更新する。UI はユーザー操作、空状態、エラー状態を優先して検証する。

## 7. Git / PR

- ブランチ名は、ユーザー指定がなければ `codex/<short-description>` を使う。
- PR の base branch は、ユーザー指定がない限り `develop` とする。
- 作業用ブランチを `develop` 以外から切った場合でも、取り込み先は原則 `develop` にする。例外が必要な場合は、PR 作成前に理由を明記してユーザーへ確認する。
- 既存ブランチ上で依頼された場合も、作業元ブランチをそのまま base branch にしない。必ず `develop` との差分、ユーザー指定、既存PRの向き先を確認する。
- コミットメッセージは英語のみ。例: `feat: add community thread creation form`
- pre-commit が環境依存で失敗した場合、代替検証を行ったうえで `--no-verify` は許容する。ただし PR Evidence と最終報告に必ず書く。
- PR は `.github/pull_request_template.md` に沿って作成する。
- PR テンプレートの固定部分（見出し、HTMLコメント、順序、`details` / `summary` 構造、コードフェンスのセクション構造）は勝手に変更・削除しない。
- PR body で編集してよいのは、`Closes #`、Todo のチェック項目、How to check のコマンド、Evidences の実行日時・ブランチ名・ログ、Related Links の追記など、テンプレート上の記入欄だけとする。
- PR body には最低限、実装内容、検証コマンド、実行日時 JST、ブランチ名、未実行チェックと理由を書く。
- review comment や discussion に返信するときは、相手の `@username` メンションを含める。

## 8. 作業ログ

- 作業の最後に `.agents/PROJECT_MEMORY.md` へ、日時、内容、主要ファイル、検証結果、次回への申し送りを追記する。
- 記憶更新に失敗した場合は、理由と追記予定の内容を最終報告に含める。
