---
name: execute-task
description: |
  機能実装やバグ修正などのIssue（タスク）をこなすための標準ワークフロー。
  Issue番号や実装依頼を受け取り、要件確認、ブランチ管理、実装、テスト、セルフレビュー、PR準備までを行う。
  Use when: 新しく指定されたIssueまたは実装タスクを開始するとき。
---

# execute-task スキル

このスキルは、Codex がプロジェクトの品質基準に沿って実装を進めるための標準ワークフローです。

## 責務

- Issue またはユーザー依頼の要件を把握する。
- `.agents/rules/rules.md` を確認し、Codex 用ルールを優先する。
- 既存実装を調査してから変更する。
- 実装、テスト、lint / type check、セルフレビューを行う。
- PR 作成を求められた場合は `create-pr` スキルへ進む。

## ワークフロー

### 1. 開始時確認

```bash
git status --short --branch
```

- 既存の未コミット差分を把握する。
- unrelated な差分は触らない。
- Issue 番号がある場合は GitHub MCP / gh / Web など利用可能な手段で内容を確認する。
- ユーザーが明確に「実装して」と言っている場合は、必要以上に停止せず実装へ進む。
- 要件が危険に曖昧な場合だけ、短く確認質問をする。

### 2. 調査

- `rg` / `rg --files` を優先して関連実装を探す。
- `rg` が使えない場合は PowerShell / `find` / `grep` へ切り替える。
- 既存のアーキテクチャ、命名、テスト方針を優先する。

### 3. 実装

- ファイル編集は原則 `apply_patch`。
- `any` は禁止。
- 変更範囲を依頼に必要な範囲へ絞る。
- Backend は Clean Architecture の層を守る。
- Frontend は Feature-Sliced Design と Server / Client Component の責務分離を守る。

### 4. テスト

テスト追加・更新時は `.agents/skills/test_coding/SKILL.md` を参照する。

基本方針:

- 正常系、異常系、境界値を検討する。
- API wrapper / hooks / use case / repository などロジック層はユニットテストを優先する。
- UI は主要な表示、空状態、エラー状態、ユーザー操作を検証する。

### 5. 品質確認

原則:

```bash
bun run lint:all
bun run test:all
```

環境制約がある場合:

- 実行できる targeted lint / type check / test を行う。
- 実行できなかったコマンドと理由を最終報告や PR Evidence に書く。

### 6. セルフレビュー

完了前に次を確認する。

- 要件を満たしているか。
- エラー時の動作が安全か。
- 既存の未コミット差分を巻き込んでいないか。
- 不要なリファクタや unrelated な変更が混ざっていないか。
- テストや Evidence が変更内容に見合っているか。

### 7. PR 作成

ユーザーが PR 作成まで依頼している場合、実装完了後に `.agents/skills/create-pr/SKILL.md` を使う。

ユーザーが PR 作成を依頼していない場合は、勝手にPRを作らず、変更内容・検証結果・次の提案を報告する。
