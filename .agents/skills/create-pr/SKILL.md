---
name: create-pr
description: |
  PR（プルリクエスト）を作成・提出するためのスキル。
  変更内容から適切なPRタイトルを付け、`.github/pull_request_template.md` に沿った本文を作成し、利用可能な GitHub 認証手段でPRを発行する。
  Use when: 実装完了後にPRを作成するとき。
---

# create-pr スキル

このスキルは、Codex がレビュー可能なPRを安全に作成するための標準ワークフローです。

## 責務

- 現在の差分、ブランチ、未コミット変更を確認する。
- 今回の依頼に関係するファイルだけを stage / commit / push する。
- `.github/pull_request_template.md` に沿ってPR本文を作る。
- 検証結果、未実行チェック、代替手段を Evidence に残す。
- PR URL をユーザーへ共有する。

## ワークフロー

### 1. 状態確認

必ず以下を確認する。

```bash
git status --short --branch
git diff --stat
git diff --cached --stat
git branch --show-current
```

未コミット差分に今回の作業と無関係なファイルがある場合、それらを stage しない。

### 2. 品質確認

原則として以下を実行する。

```bash
bun run lint:all
bun run test:all
```

環境に `bun` がない場合は、実行できる代替を使う。

例:

```bash
apps/frontend/node_modules/.bin/tsc --noEmit --project apps/frontend/tsconfig.json
apps/frontend/node_modules/.bin/eslint <changed-files-or-dirs>
```

未実行のチェックと理由は PR Evidence に必ず書く。

### 3. コミット

- commit message は英語 / ASCII のみ。
- Conventional Commits に従う。
- 例: `feat: add community thread creation form`
- pre-commit が `bun` 不在など環境理由で失敗した場合、代替検証を通したうえで `--no-verify` を使ってよい。ただし Evidence に必ず書く。

### 4. Push

優先順:

1. `git push -u origin <branch>`
2. SSH が失敗する場合は HTTPS remote へ push
3. `gh` が利用可能なら `gh auth status` を確認して push / PR 作成
4. GitHub MCP が write 可能なら MCP で branch / PR 作成
5. GitHub MCP が 403 の場合は、権限不足として別認証手段へ切り替える

どの手段を使ったかを最終報告に書く。

### 5. PR本文

`.github/pull_request_template.md` を読み、テンプレートの固定部分を保持したまま、最低限以下を埋める。

固定部分の扱い:

- 見出し、HTMLコメント、順序、`details` / `summary` 構造、コードフェンスのセクション構造を勝手に変更・削除しない。
- 編集してよいのは、`Closes #`、Todo のチェック項目、How to check のコマンド、Evidences の実行日時・ブランチ名・ログ、Related Links の追記など、テンプレート上の記入欄だけ。
- PR 本文・PRコメント・レビュー回答は、ユーザーから別指定がない限り日本語で書く。

- Issue: `Closes #...`。Issue が不明なら `Closes #` のままにし、不明であることを書く。
- Todo: 実装内容をチェック済みにする。
- How to check: 実行した検証コマンドを書く。
- Evidences: 実行日時 JST、ブランチ名、コミット、検証結果、未実行チェックと理由を書く。

### 6. PR作成

- デフォルトは draft PR。
- base branch は作業元ブランチを確認して決める。現在ブランチの upstream や `git merge-base`、ユーザー指定を優先する。
- title は領域プレフィックスを必要に応じて付ける。例: `[FE] feat: add community thread creation form`

### 7. 完了報告

ユーザーへ以下を報告する。

- PR URL
- branch
- commit
- base branch
- 実行した検証
- 未実行チェックと理由
- 未コミットで残っている unrelated 差分があればその事実
