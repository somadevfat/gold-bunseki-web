# Codex Project Instructions

このリポジトリで作業する Codex は、必ず `.agents/rules/rules.md` を一次ルールとして読むこと。

- Issue 実装を開始するときは `.agents/skills/execute-task/SKILL.md` を使う。
- PR 作成を求められたときは `.agents/skills/create-pr/SKILL.md` を使う。
- テストコードを追加・更新するときは `.agents/skills/test_coding/SKILL.md` を参照する。
- アーキテクチャ判断を伴う変更では `.agents/skills/adr-manager/SKILL.md` を参照する。
- 一連の作業を終えるときは `.agents/skills/project_memory/SKILL.md` に従って `.agents/PROJECT_MEMORY.md` を更新する。

Codex は、Cursor / Copilot 向けの古い記述よりも、上記の Codex 用ルールを優先する。

基本のやり取り、PR本文、PRコメント、レビュー回答は日本語で行う。
PR本文は `.github/pull_request_template.md` の固定部分（見出し・HTMLコメント・順序・details構造など）を変更せず、記入欄だけを埋めること。
