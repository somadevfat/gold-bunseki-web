# Copilot / Cursor / Codex Instructions

このリポジトリの一次ルールは `.agents/rules/rules.md` です。

Copilot、Cursor、Codex のどれを使う場合でも、古いツール固有の慣習ではなく `.agents/rules/rules.md` を優先してください。

## 要約

- 回答、PR本文、PRコメント、レビュー回答は基本日本語。
- コミットメッセージは Conventional Commits かつ英語 / ASCII のみ。
- TypeScript の `any` は禁止。
- 作業前に `git status --short --branch` を確認する。
- 既存の未コミット差分を勝手に revert しない。
- Issue 実装は `.agents/skills/execute-task/SKILL.md`。
- PR 作成は `.agents/skills/create-pr/SKILL.md`。
- PR の base branch は、ユーザー指定がない限り `develop`。
- PR本文は `.github/pull_request_template.md` の固定部分（見出し・コメント・順序・details構造）を変更せず、記入欄だけを埋める。
- テスト作成は `.agents/skills/test_coding/SKILL.md`。
- 作業終了時は `.agents/skills/project_memory/SKILL.md` に従って記憶を更新する。
